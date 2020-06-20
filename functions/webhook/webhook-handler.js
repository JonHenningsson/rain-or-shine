const debug = require('debug')('rain-or-shine:webhook-handler');
const MyStrava = require('mystrava');
const MyUserDB = require('myuserdb');
const MyWeather = require('./weather');

async function handleNewActivity(event, response) {
  const edebug = debug.extend('handleNewActivity');
  edebug('Handling request..');
  return new Promise(
    async (resolve, reject) => {
      const json = JSON.parse(event.body);
      const ownerId = parseFloat(json.owner_id);

      // check if user exists (is in our db)
      let user;
      let active = false;
      const udb = new MyUserDB();
      try {
        user = await udb.getUser(ownerId);
        active = (user.data.settings.status === 'active');
      } catch (err) {
        response.body = 'Unknown user!';
      }

      // check if access token is valid and get new if needed
      if (user && active) {
        let activity;
        let accessToken;
        const mys = new MyStrava();
        let tokenInfo;
        const now = Math.floor(new Date() / 1000);
        const diff = user.data.expiresAt - now;
        if (diff < 10) {
          try {
            tokenInfo = await mys.updateAccessToken(user.data.refreshToken);
            await udb.updateTokenInfo(
              user.ref,
              tokenInfo.accessToken,
              tokenInfo.refreshToken,
              tokenInfo.expiresAt,
            );
          } catch (err) {
            reject(new Error('Unable to update access token'));
          }
        }

        // use new token if present
        if (tokenInfo) {
          accessToken = tokenInfo.access_token;
        } else {
          accessToken = user.data.accessToken;
        }

        // get activity
        const activityId = parseFloat(json.object_id);
        try {
          activity = await mys.getActivity(activityId, accessToken);
        } catch (err) {
          reject(new Error('Unable to get activity'));
        }

        // todo: check that activity is outdoor
        const data = {};
        let coords = {};
        let date;
        if (activity) {
          if (
            activity.start_latitude
            && activity.start_longitude
          ) {
            coords = {
              latitude: activity.start_latitude,
              longitude: activity.start_longitude,
            };
          } else {
            edebug('No latitude or longitude found');
            resolve(response);
          }

          if (activity.start_date) {
            try {
              date = new Date(activity.start_date);
            } catch (err) {
              edebug('Unable to identify date and time of activity');
              resolve(response);
            }
          } else {
            edebug('No start date found');
            resolve(response);
          }

          // get weather info
          if (coords.latitude && coords.longitude && date) {
            try {
              const myw = new MyWeather(user.data.settings);
              await myw.getWeatherData(coords, date);
              data.description = await myw.createWeatherDescription(activity.description);
            } catch (err) {
              reject(new Error('Unable to get weather information'));
            }
          }
        }

        // update activity
        try {
          if (data.description) {
            await mys.updateActivity(activityId, accessToken, data);
          }
        } catch (err) {
          reject(new Error('Unable to update activity'));
        }
      }

      resolve(response);
    },
  );
}

async function handleValidationReq(event, response) {
  const edebug = debug.extend('handleValidationReq');
  edebug('Attempting to verify validation request..');
  return new Promise(
    async (resolve, reject) => {
      const mys = new MyStrava();
      const verifyTokenReq = event.queryStringParameters['hub.verify_token'];
      const challenge = event.queryStringParameters['hub.challenge'];

      if (verifyTokenReq === mys.verify_token) {
        response.headers = {
          'Content-Type': 'application/json',
        };
        response.body = JSON.stringify({
          'hub.challenge': challenge,
        });
      } else {
        reject(new Error('Verify token incorrect'));
      }
      resolve(response);
    },
  );
}

async function handleAthleteAuthFalse(event, response) {
  const edebug = debug.extend('handleAthleteAuthFalse');
  edebug('Attempting to remove user from db..');
  return new Promise(
    async (resolve, reject) => {
      const json = JSON.parse(event.body);
      const ownerId = parseFloat(json.owner_id);
      let user;
      const udb = new MyUserDB();

      try {
        user = await udb.getUser(ownerId);
      } catch (err) {
        response.body = 'Unknown user!';
      }

      if (user) {
        try {
          await udb.delUser(user.ref);
        } catch (err) {
          response.body = 'Unable to remove user from db!';
          reject(response);
        }
      }
      resolve(response);
    },
  );
}


async function webhook(event, response) {
  const edebug = debug.extend('webhook');
  edebug('Attempting to handle webhook event..');
  edebug('NODE_ENV: %s', process.env.NODE_ENV);
  return new Promise(
    async (resolve, reject) => {
      try {
        let r = response;
        const mys = new MyStrava();
        // Validation request handling
        if (await mys.isValidationReq(event)) {
          r = await handleValidationReq(event, r);
          // New activity request handling
        } else if (await mys.isActivityCreateReq(event)) {
          if (!(process.env.NODE_ENV === 'production')) {
            r = await handleNewActivity(event, r);
          } else {
            // execute async if this is production
            handleNewActivity(event, r);
          }
          // athlete deauthorized app
        } else if (await mys.isAthleteUpdateAuthFalseReq(event)) {
          if (!(process.env.NODE_ENV === 'production')) {
            r = await handleAthleteAuthFalse(event, r);
          } else {
            // execute async if this is production
            handleAthleteAuthFalse(event, r);
          }
          // Others - not implemented
        } else {
          r.body = 'Not implemented';
          edebug('No handling for this event..');
        }
        // Resolve webhook helper promise
        resolve(r);
      } catch (err) {
        reject(err);
      }
    },
  );
}


module.exports.webhook = webhook;
