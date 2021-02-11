const debug = require('debug')('rain-or-shine:MyWeather');
const qty = require('js-quantities');
const NWS = require('./nws');

class MyWeather {
  constructor(userSettings) {
    const edebug = debug.extend('constructor');
    edebug('Constructor');
    edebug('Initialized constructor with settings: %O', userSettings);

    this.userSettings = userSettings;
    this.descrOrder = [
      'description',
      'temperature',
      'heatIndex',
      'windchill',
      'relativeHumidity',
      'windSpeed',
    ];
  }

  getWeatherData = (coords, date) => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('getWeatherData');
      edebug('Got coordinates: %o', coords);
      edebug('Got date: %o', date);
      edebug('Getting weather based on provider in settings..');
      try {
        switch (this.userSettings.weatherProvider) {
          case 'NWS': {
            const mynws = new NWS();
            this.weather = await mynws.getWeather(coords, date);
          }
            break;
          default:
            throw new Error('Unknown weather provider in settings');
        }

        /* To-do: Use Settings -> weatherProps to sanitize the weather data and only return
         * what is known */

        resolve(this.convert());
      } catch (err) {
        edebug('Error: %s', err.message);
        reject(err);
      }
    },
  );

  convert = () => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('convert');
      try {
        let unit;
        let newUnit;
        let val;
        let qtyFrom;
        let qtyTo;
        const tempUnits = {
          temperatureUnit: 'temperature',
          heatIndexUnit: 'heatIndex',
          windchillUnit: 'windchill',
        };
        const windUnits = {
          windSpeedUnit: 'windSpeed',
        };


        edebug('Converting units if needed..');
        Object.keys(this.userSettings).forEach(async (key) => {
          if (Object.prototype.hasOwnProperty.call(this.weather, key)) {
            if (this.userSettings[key] !== this.weather[key]) {
              // temperature unit conversion
              if (Object.prototype.hasOwnProperty.call(tempUnits, key)) {
                unit = this.weather[key];
                val = this.weather[tempUnits[key]];
                newUnit = this.userSettings[key];
                qtyFrom = (unit === '℃' && 'tempC')
                  || (unit === '℉' && 'tempF')
                  || (unit === 'K' && 'tempK');
                qtyFrom = `${val} ${qtyFrom}`;

                qtyTo = (newUnit === '℃' && 'tempC')
                  || (newUnit === '℉' && 'tempF')
                  || (newUnit === 'K' && 'tempK');

                if (val) {
                  this.weather[tempUnits[key]] = Math.round(qty(qtyFrom).to(qtyTo).scalar);
                  this.weather[key] = newUnit;

                  edebug('Old: %d %s', val, unit);
                  edebug('New: %d %s', this.weather[tempUnits[key]], this.weather[key]);
                }

                // windspeed unit conversion
                // do not check if weather is present here. move to NWS class instead.
              } else if (Object.prototype.hasOwnProperty.call(windUnits, key)
                && this.weather[windUnits[key]]) {
                unit = this.weather[key];
                val = this.weather[windUnits[key]];
                newUnit = this.userSettings[key];

                qtyFrom = (unit === 'm/s' && 'm/s')
                  || (unit === 'mph' && 'mph')
                  || (unit === 'km/h' && 'km/h')
                  || (unit === 'kn' && 'kn');
                qtyFrom = `${val} ${qtyFrom}`;

                qtyTo = (newUnit === 'm/s' && 'm/s')
                  || (newUnit === 'mph' && 'mph')
                  || (newUnit === 'km/h' && 'km/h')
                  || (newUnit === 'kn' && 'kn');

                if (val) {
                  // one decimal for windspeed
                  const cVal = Math.round((qty(qtyFrom).to(qtyTo).scalar + Number.EPSILON) * 10) / 10;
                  this.weather[windUnits[key]] = cVal;
                  this.weather[key] = newUnit;

                  edebug('Old: %d %s', val, unit);
                  edebug('New: %d %s', this.weather[windUnits[key]], this.weather[key]);
                }
              }
            }
          }
        });

        resolve(this.weather);
      } catch (err) {
        edebug('Error: %s', err.message);
        reject(err);
      }
    },
  );

  createWeatherDescription = (ed) => new Promise(
    async (resolve, reject) => {
      let existingDescr = ed;
      const edebug = debug.extend('createWeatherDescription');
      edebug('Got existingDescr: %s', existingDescr);
      if (existingDescr === null) {
        edebug('Got null, setting empty string');
        existingDescr = '';
      }
      edebug('Attempting to create weather description..');
      try {
        const e = existingDescr;
        const attrArr = this.descrOrder;
        const w = this.weather;
        let descr = '';

        attrArr.forEach((attr, index) => {
          if (Object.prototype.hasOwnProperty.call(w, attr)) {
            if (index !== 0) {
              descr += ', ';
            }
            if ((attr === 'description') && (w.description)) {
              descr += `${w.description}`;
            } else if ((attr === 'temperature') && (w.temperature)) {
              descr += `${w.temperature}${w.temperatureUnit}`;
            } else if ((attr === 'heatIndex') && (w.heatIndex)) {
              descr += `Feels like ${w.heatIndex}${w.heatIndexUnit}`;
            } else if ((attr === 'windchill') && (w.windchill)) {
              descr += `Feels like ${w.windchill}${w.windchillUnit}`;
            } else if ((attr === 'relativeHumidity') && (w.relativeHumidity)) {
              descr += `Humidity ${w.relativeHumidity}${w.relativeHumidityUnit}`;
            } else if ((attr === 'windSpeed') && (w.windSpeed || w.windSpeed === 0)) {
              descr += `Wind ${w.windSpeed} ${w.windSpeedUnit}`;
              if (w.wind_speed !== 0) {
                descr += ` from ${w.windDirection}`;
              }
            }
          }
        });

        descr = descr.replace(/, +$/, '');

        let newDescr = descr;
        if (e !== '') {
          if (this.userSettings.weatherInfoPlacement === 'before') {
            newDescr += `\n${e}`;
          } else {
            newDescr = `${e}\n${newDescr}`;
          }
        }
        edebug('Created weather description: %s', newDescr);
        resolve(newDescr);
      } catch (err) {
        edebug('Error: %s', err.message);
        reject(err);
      }
    },
  );
}

module.exports = MyWeather;
