const qty = require('js-quantities');
const NWS = require('./nws');

class MyWeather {
  constructor(userSettings) {
    this.userSettings = userSettings;
    this.descrOrder = [
      'description',
      'temperature',
      'heatIndex',
      'relativeHumidity',
      'windSpeed',
    ];
  }

  getWeatherData = (coords, date) => new Promise(
    async (resolve, reject) => {
      try {
        switch (this.userSettings.weatherProvider) {
          case 'NWS':
            {
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
        console.log(err);
        reject(err);
      }
    },
  );

  convert = () => new Promise(
    async (resolve, reject) => {
      try {
        let unit;
        let newUnit;
        let val;
        let qtyFrom;
        let qtyTo;
        const tempUnits = {
          temperatureUnit: 'temperature',
          heatIndexUnit: 'heatIndex',
        };
        const windUnits = {
          windSpeedUnit: 'windSpeed',
        };

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

                this.weather[tempUnits[key]] = Math.round(qty(qtyFrom).to(qtyTo).scalar);
                this.weather[key] = newUnit;

              // windspeed unit conversion
              } else if (Object.prototype.hasOwnProperty.call(windUnits, key)) {
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

                // one decimal for windspeed
                const cVal = Math.round((qty(qtyFrom).to(qtyTo).scalar + Number.EPSILON) * 10) / 10;
                this.weather[windUnits[key]] = cVal;
                this.weather[key] = newUnit;
              }
            }
          }
        });

        resolve(this.weather);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    },
  );

  createWeatherDescription = (existingDescr) => new Promise(
    async (resolve, reject) => {
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

        resolve(newDescr);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    },
  );
}

module.exports = MyWeather;
