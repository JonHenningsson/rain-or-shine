const debug = require('debug')('rain-or-shine:NWS');
const validator = require('validator');
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

debug('NWS_API_UA_EMAIL: %s', NWS_API_UA_EMAIL);
debug('NWS_API_UA_WEBSITE: %s', NWS_API_UA_WEBSITE);

class NWS {
  constructor() {
    const edebug = debug.extend('constructor');
    edebug('Constructor');
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
    const edebug = debug.extend('degToCompass');
    edebug('Attempting to convert degrees: %d ..', degrees);
    const degreesRounded = Math.round(degrees);
    const val = Math.floor((degreesRounded / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const dir = arr[(val % 16)];
    edebug('Result: %s ..', dir);
    return dir;
  };

  getWeather = (coords, date) => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('getWeather');
      edebug('Got coordinates: %o', coords);
      edebug('Got date: %o', date);
      try {
        // get station closest to coordinates
        edebug('Attempting to get nearest weather station');
        const station = await this.getStation(coords);
        let searchDate = date;
        const now = new Date();
        const latestObsDate = new Date();
        latestObsDate.setMinutes(53);
        latestObsDate.setSeconds(0);
        latestObsDate.setMilliseconds(0);

        edebug('Attempting to determine date for observation..');
        if (now.getMinutes() < 53) {
          latestObsDate.setHours(now.getHours() - 1);
        }
        edebug('Latest observation: %o', latestObsDate);

        const diff = (latestObsDate.getTime() - date.getTime()) / 1000;
        edebug('Diff: %d', diff);

        // if start is less than 3600s newer or less than 30m older than latest observation
        if ((diff > -3600) && (diff <= 1800)) {
          searchDate = latestObsDate;

          // if start is 30m older than latest observation
        } else if (diff > 1800) {
          searchDate.setMinutes(53);
          searchDate.setSeconds(0);0
          searchDate.setMilliseconds(0);

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
        edebug('Attempting to get observation');
        const observation = await this.getObservation(station, searchDate);
        const nwsWeather = {};
        let jpArr = [];

        // to-do: Do not add units if the value is empty or null
        Object.keys(this.nwsMap).forEach((key) => {
          jpArr = JSONPath(this.nwsMap[key], observation);
          if (jpArr.length > 0) {
            if (jpArr[0] !== null) {
              edebug('JSONPath: %s, value: %s', this.nwsMap[key], jpArr[0]);
              [nwsWeather[key]] = jpArr;
            }
          }
        });

        // normalize
        let v;
        Object.keys(nwsWeather).forEach(async (key) => {
          v = nwsWeather[key];
          if (key === 'windDirection') {
            nwsWeather[key] = this.degToCompass(v);
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
      const edebug = debug.extend('getStation');
      edebug('Got coordinates: %o', coords);
      try {
        const lat = coords.latitude;
        const lon = coords.longitude;

        const url = `${this.baseurl}/points/${lat},${lon}/stations`;

        edebug('Attempting to get stations: %s', url);
        https.get(url, this.options, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            // do stuff with the data here
            const resTable = JSON.parse(data);
            edebug('Success: %O', resTable);
            if (resTable.features) {
              const station = resTable.features[0].properties.stationIdentifier;
              resolve(station);
            }
          });
        }).on('error', (err) => {
          edebug('Failed: %s', err.message);
          reject(err);
        });
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );


  getObservation = (station, date) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('getObservation');
      edebug('Got station: %s', station);
      edebug('Got date: %s', date);
      try {
        const url = `${this.baseurl}/stations/${station}/observations/${date}`;
        edebug('Attempting to get observation: %s', url);

        https.get(url, this.options, (resp) => {
          let data = '';

          resp.on('data', (chunk) => {
            data += chunk;
          });

          resp.on('end', () => {
            // do stuff with the data here
            const resTable = JSON.parse(data);
            if (resTable.properties) {
              edebug('Success: %O', resTable);
              resolve(resTable);
            } else {
              reject(new Error('Unable to get observation'));
            }
          });
        }).on('error', (err) => {
          edebug('Failed: %s', err.message);
          reject(err);
        });
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );

  normalizeAttr = (val, decimals) => new Promise(
    async (resolve, reject) => {
      let v = val;
      const edebug = debug.extend('normalizeAttr');
      edebug('Attempting to normalize: %s', v);
      try {
        let vNormalized = v;
        // round to n decimals
        if ((validator.isNumeric(v.toString())) && (!Number.isInteger(v))) {
          v = parseFloat(v);
          const d = decimals || 0;
          const pow = 10 ** d;
          vNormalized = Math.round((v + Number.EPSILON) * pow) / pow;
          // degree C
        } else if (v === 'unit:degC') {
          vNormalized = '℃';
          // unit m/s
        } else if (v === 'unit:m_s-1') {
          vNormalized = 'm/s';
          // unit km/h
        } else if (v === 'unit:km_h-1') {
          vNormalized = 'km/h';
          // unit %
        } else if (v === 'unit:percent') {
          vNormalized = '%';
        }
        edebug('Result: %s', vNormalized);
        resolve(vNormalized);
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );
}

module.exports = NWS;
