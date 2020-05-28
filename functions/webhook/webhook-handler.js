const mystrava = require('mystrava');
const myuserdb = require('myuserdb');
const weather = require('./weather');

async function getWeather(coords, date, provider) {
  return new Promise(
    async (resolve, reject) => {
      try {
        let myw = new weather();
        let provider = "NWS";
        let res = await myw.getWeatherData(coords, date, provider)
        resolve(res);
      } catch (err) {
        reject(err);
      }

    }
  )

};

async function createWeatherDescription(weather, attr_arr) {
  return new Promise(
    async (resolve, reject) => {
      try {
        let descr = "";
        attr_arr.forEach(function(attr, index) {
          if (weather.hasOwnProperty(attr)) {
            if (index != 0) {
              descr += ", ";
            }
            if ((attr == "description") && (weather.description)) {
              descr += `${weather.description}`;
            } else if ((attr == "temperature") && (weather.temperature)) {
              descr += `${weather.temperature}${weather.temperature_unit}`;
            } else if ((attr == "heat_index") && (weather.heat_index)) {
              descr += `Feels like ${weather.heat_index}${weather.heat_index_unit}`;
            } else if ((attr == "relative_humidity") && (weather.relative_humidity)) {
              descr += `Humidity ${weather.relative_humidity}${weather.relative_humidity_unit}`;
            } else if ((attr == "wind_speed") && (weather.wind_speed || weather.wind_speed == 0)) {
              descr += `Wind ${weather.wind_speed} ${weather.wind_speed_unit}`;
              if (!weather.wind_speed == 0) {
                descr += ` from ${weather.wind_direction}`;
              }
            }
          }
        });

        descr = descr.replace(/\, +$/, "");

        resolve(descr);
      } catch (err) {
        reject(err);
      }

    }
  )

};


async function handleNewActivity(event, response) {
  return new Promise(
    async (resolve, reject) => {
      let json = JSON.parse(event.body);
      let owner_id = parseFloat(json.owner_id);

      // check if user exists (is in our db)
      let user;
      let udb = new myuserdb();
      try {
        user = await udb.getUser(owner_id);
      } catch (err) {
        response.body = "Unknown user!";
        console.log("Unknown user!");
      }

      // check if access token is valid and get new if needed
      if (user) {
        let mys = new mystrava();
        let token_info;
        let now = Math.floor(new Date() / 1000);
        let diff = user.data.expires_at - now;
        if (diff < 10) {

          let res;
          try {
            token_info = await mys.updateAccessToken(user.data.refresh_token);
            res = await udb.updateTokenInfo(
              user.ref,
              token_info.access_token,
              token_info.refresh_token,
              token_info.expires_at
            );
          } catch (err) {
            reject("Unable to update access token");
          }
        }

        // use new token if present
        let access_token;
        if (token_info) {
          access_token = token_info.access_token;
        } else {
          access_token = user.data.access_token;
        }

        // get activity
        let activity_id = parseFloat(json.object_id);
        let activity;
        try {
          activity = await mys.getActivity(activity_id, access_token);
        } catch (err) {
          reject("Unable to get activity");
        }

        // todo: check that activity is outdoor
        let data = {};
        let coords = {};
        let date;
        if (activity) {

          if (
            activity.start_latitude &&
            activity.start_longitude
          ) {
            coords = {
              "latitude": activity.start_latitude,
              "longitude": activity.start_longitude
            };
          } else {
            reject("No latitude or longitude found");
          }

          if (activity.start_date) {
            try {
              date = new Date(activity.start_date);
            } catch (err) {
              reject("Unable to identify date and time of activity");
            }

          } else {
            reject("No start date found");
          }

          // get weather info
          if (coords.latitude && date) {
            try {
              let weather = await getWeather(coords, date);
              console.log("Got weather information");
              let existing_description = "";
              if (activity.description) {
                existing_description = activity.description;
              }

              let descr_order = [
                "description",
                "temperature",
                "heat_index",
                "relative_humidity",
                "wind_speed"
              ]
              let new_descr = await createWeatherDescription(weather, descr_order);
              data.description = new_descr + "\n" + existing_description;
            } catch (err) {
              reject("Unable to get weather information");
            }
          }

        }

        // update activity
        try {
          if (data.description) {
            await mys.updateActivity(activity_id, access_token, data);
            console.log("Updated activity!");
          }
        } catch (err) {
          reject("Unable to update activity");
        }
      }

      resolve(response);

    }
  )
};

async function handleValidationReq(event, response) {
  return new Promise(
    async (resolve, reject) => {
      let mys = new mystrava();
      let verify_token_req = event.queryStringParameters["hub.verify_token"];
      let challenge = event.queryStringParameters["hub.challenge"];

      if (verify_token_req == mys.verify_token) {
        response.headers = {
            "Content-Type": "application/json"
          },
          response.body = JSON.stringify({
            "hub.challenge": challenge
          });
      } else {
        reject("Verify token incorrect");
      }
      console.log("Handled validation request!");
      resolve(response);
    }
  )
};


async function webhook(event, response) {
  console.log("Webhook event being handled..");
  return new Promise(
    async (resolve, reject) => {
      try {
        let mys = new mystrava();
        // Validation request handling
        if (await mys.is_validation_req(event)) {
          response = await handleValidationReq(event, response);
          // New activity request handling
        } else if (await mys.is_activity_create_req(event)) {
          if (!(process.env.NODE_ENV == "production")) {
            response = await handleNewActivity(event, response);
          } else {
            // execute async if this is production
            handleNewActivity(event, response);
          }
          // Others - not implemented
        } else {
          response.body = "Not implemented";
        }

        console.log("Done handling webhook!");
        // Resolve webhook helper promise
        resolve(response);
      } catch (err) {
        reject(err);
      }

    }
  )

}


module.exports.webhook = webhook;
