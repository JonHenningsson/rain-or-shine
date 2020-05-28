const {
  http,
  https
} = require('follow-redirects');
https.maxRedirects = 2;
https.maxBodyLength = 5 * 1024 * 1024;

const NWS_API_UA_EMAIL = process.env.NWS_API_UA_EMAIL || "";
const NWS_API_UA_WEBSITE = process.env.NWS_API_UA_URL || process.env.URL || "";

class NWS {
  constructor() {
    this.nws_api_user_agent = `(${NWS_API_UA_WEBSITE}, ${NWS_API_UA_EMAIL})`;
    this.baseurl = "https://api.weather.gov";
    this.options = {
      headers: {
        "User-Agent": this.nws_api_user_agent
      }
    }

  }

  // NWS
  // history data available 7d?
  // Observations always on minute 53 and second 00
  // Observation date formatted as e.g. 2020-05-24T11:53:00+00:00
  //
  // 1. Get list of stations
  //  GET https://api.weather.gov/points/32.87,-96.93/stations
  // 2. Determine best observation to retrieve (by date)
  // 3. Get observation
  //  GET https://api.weather.gov/stations/KDAL/observations/2020-05-24T11:53:00+00:00

  getWeather = (coords, date) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          let lat = coords.latitude;
          let lon = coords.longitude;

          // get station closest to coordinates
          let station = await this.getStation(coords);

          let search_date = date;
          let now = new Date();
          let latest_obs_date = new Date();
          latest_obs_date.setMinutes(53);

          if (now.getMinutes() < 53) {
            latest_obs_date.setHours(now.getHours() - 1);
          }

          let diff = latest_obs_date.getTime() - date.getTime();

          // if start is less than 3600s newer or less than 30m older than latest observation
          if ((diff > -3600) && (diff <= 1800)) {
            search_date = latest_obs_date;

            // if start is 30m older than latest observation
          } else if (diff > 1800) {

            search_date.setMinutes(53);
            search_date.setSeconds(0);

            // if minute is 23 or earlier, use observation from previous hour.
            // i.e. start time at 15:22 will use observation of 14:53
            if (date.getMinutes() < 23) {
              search_date.setHours(date.getHours() - 1);
            }

          } else {
            reject("Unable to determine observation to check for date: " + date.toISOString());
          }

          search_date = search_date.toISOString();
          search_date = search_date.replace("Z", "+00:00").replace(".000", "");

          let observation = await this.getObservation(station, search_date);
          resolve(observation);

        } catch (err) {
          reject(err);
        }

      }
    )
  };


  getStation = (coords) => {
    return new Promise(
      (resolve, reject) => {
        try {
          let lat = coords.latitude;
          let lon = coords.longitude;

          let url = `${this.baseurl}/points/${lat},${lon}/stations`;

          https.get(url, this.options, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              // do stuff with the data here
              let resTable = JSON.parse(data);
              if (resTable.features) {
                let station = resTable.features[0].properties.stationIdentifier;
                resolve(station);
              }

            });

          }).on("error", (err) => {
            reject(err);
          });


        } catch (err) {
          reject(err);
        }

      }
    )
  };


  getObservation = (station, date) => {
    return new Promise(
      (resolve, reject) => {
        try {

          let url = `${this.baseurl}/stations/${station}/observations/${date}`;
          console.log(url);

          https.get(url, this.options, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
              data += chunk;
            });

            resp.on('end', () => {
              // do stuff with the data here
              let resTable = JSON.parse(data);
              if (resTable.properties) {

                resolve(resTable)
              } else {
                reject("Unable to get observation");
              }

            });

          }).on("error", (err) => {
            reject(err);
          });


        } catch (err) {
          reject(err);
        }

      }
    )
  };

  normalizeAttr = (v) => {
    return new Promise(
      async (resolve, reject) => {
        try {

          // round to zero decimals
          if ((typeof(v) == "number") && (!Number.isInteger(v))) {
            v = Math.round(v);
            // degree C
          } else if (v == "unit:degC") {
            v = "℃";
            // unit m/s
          } else if (v == "unit:m_s-1") {
            v = "m/s";
            // unit %
          } else if (v == "unit:percent") {
            v = "%";
          }
          resolve(v);

        } catch (err) {
          reject(err);
        }

      }
    )
  };

}

module.exports = NWS;
