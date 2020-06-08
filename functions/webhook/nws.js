const {
  https,
} = require('follow-redirects');
const {
  JSONPath,
} = require('jsonpath-plus');

https.maxRedirects = 2;
https.maxBodyLength = 5 * 1024 * 1024;

const NWS_API_UA_EMAIL = process.env.NWS_API_UA_EMAIL || '';
const NWS_API_UA_WEBSITE = process.env.NWS_API_UA_URL || process.env.URL || '';

class NWS {
  constructor() {
    this.nws_api_user_agent = `(${NWS_API_UA_WEBSITE}, ${NWS_API_UA_EMAIL})`;
    this.baseurl = 'https://api.weather.gov';
    this.options = {
      headers: {
        'User-Agent': this.nws_api_user_agent,
      },
    };

    this.nwsMap = {
      description: '$.properties.textDescription',
      temperature: '$.properties.temperature.value',
      temperatureUnit: '$.properties.temperature.unitCode',
      dewpoint: '$.properties.dewpoint.value',
      dewpointUnit: '$.properties.dewpoint.unitCode',
      windDirection: '$.properties.windDirection.value',
      windSpeed: '$.properties.windSpeed.value',
      windSpeedUnit: '$.properties.windSpeed.unitCode',
      relativeHumidity: '$.properties.relativeHumidity.value',
      relativeHumidityUnit: '$.properties.relativeHumidity.unitCode',
      windChill: '$.properties.windChill.value',
      windChillUnit: '$.properties.windChill.unitCode',
      heatIndex: '$.properties.heatIndex.value',
      heatIndexUnit: '$.properties.heatIndex.unitCode',
    };
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

  degToCompass = (degrees) => {
    const degreesRounded = Math.round(degrees);
    const val = Math.floor((degreesRounded / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return arr[(val % 16)];
  };

  getWeather = (coords, date) => new Promise(
    async (resolve, reject) => {
      try {
        // get station closest to coordinates
        const station = await this.getStation(coords);

        let searchDate = date;
        const now = new Date();
        const latestObsDate = new Date();
        latestObsDate.setMinutes(53);

        if (now.getMinutes() < 53) {
          latestObsDate.setHours(now.getHours() - 1);
        }

        const diff = latestObsDate.getTime() - date.getTime();

        // if start is less than 3600s newer or less than 30m older than latest observation
        if ((diff > -3600) && (diff <= 1800)) {
          searchDate = latestObsDate;

          // if start is 30m older than latest observation
        } else if (diff > 1800) {
          searchDate.setMinutes(53);
          searchDate.setSeconds(0);

          // if minute is 23 or earlier, use observation from previous hour.
          // i.e. start time at 15:22 will use observation of 14:53
          if (date.getMinutes() < 23) {
            searchDate.setHours(date.getHours() - 1);
          }
        } else {
          reject(new Error(`Unable to determine observation to check for date: ${date.toISOString()}`));
        }

        searchDate = searchDate.toISOString();
        searchDate = searchDate.replace('Z', '+00:00').replace('.000', '');

        const observation = await this.getObservation(station, searchDate);
        const nwsWeather = {};
        let jpArr = [];

        Object.keys(this.nwsMap).forEach((key) => {
          jpArr = JSONPath(this.nwsMap[key], observation);
          if (jpArr.length > 0) {
            if (jpArr[0] !== null) {
              [nwsWeather[key]] = jpArr;
            }
          }
        });

        // normalize
        let v;
        Object.keys(nwsWeather).forEach(async (key) => {
          v = nwsWeather[key];
          if (key === 'windDirection') {
            if (typeof v === 'number') {
              nwsWeather[key] = this.degToCompass(v);
            }
          } else if (key === 'windSpeed') {
            nwsWeather[key] = await this.normalizeAttr(v, 1);
          } else {
            nwsWeather[key] = await this.normalizeAttr(v);
          }
        });

        resolve(nwsWeather);
      } catch (err) {
        reject(err);
      }
    },
  );


  getStation = (coords) => new Promise(
    (resolve, reject) => {
      try {
        const lat = coords.latitude;
        const lon = coords.longitude;

        const url = `${this.baseurl}/points/${lat},${lon}/stations`;

        https.get(url, this.options, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            // do stuff with the data here
            const resTable = JSON.parse(data);
            if (resTable.features) {
              const station = resTable.features[0].properties.stationIdentifier;
              resolve(station);
            }
          });
        }).on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    },
  );


  getObservation = (station, date) => new Promise(
    (resolve, reject) => {
      try {
        const url = `${this.baseurl}/stations/${station}/observations/${date}`;
        console.log(url);

        https.get(url, this.options, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            // do stuff with the data here
            const resTable = JSON.parse(data);
            if (resTable.properties) {
              resolve(resTable);
            } else {
              reject(new Error('Unable to get observation'));
            }
          });
        }).on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    },
  );

  normalizeAttr = (v, decimals) => new Promise(
    async (resolve, reject) => {
      try {
        const d = decimals || 0;
        const pow = 10 ** d;
        let vNormalized = v;
        // round to n decimals
        if ((typeof (v) === 'number') && (!Number.isInteger(v))) {
          vNormalized = Math.round((v + Number.EPSILON) * pow) / pow;
          // degree C
        } else if (v === 'unit:degC') {
          vNormalized = '℃';
          // unit m/s
        } else if (v === 'unit:m_s-1') {
          vNormalized = 'm/s';
          // unit %
        } else if (v === 'unit:percent') {
          vNormalized = '%';
        }
        resolve(vNormalized);
      } catch (err) {
        reject(err);
      }
    },
  );
}

module.exports = NWS;
