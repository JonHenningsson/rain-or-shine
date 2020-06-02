const {
  JSONPath,
} = require('jsonpath-plus');
const NWS = require('./nws');

class MyWeather {
  constructor() {
    this.weather_props = {
      description: 'Weather description',
      temperature: 'Temperature',
      temperature_unit: 'Temperature unit',
      dewpoint: 'Dewpoint',
      dewpoint_unit: 'Dewpoint unit',
      wind_direction: 'Wind direction',
      wind_speed: 'Wind speed',
      wind_speed_unit: 'Wind speed unit',
      relative_humidity: 'Relative humidity',
      relative_humidity_unit: 'Relative humidity unit',
      windchill: 'Temperature unit',
      windchill_unit: 'Windchill unit',
      heat_index: 'Heat index',
      heat_index_unit: 'Heat index unit',
    };
  }

  degToCompass = (degrees) => {
    const degreesRounded = Math.round(degrees);
    const val = Math.floor((degreesRounded / 22.5) + 0.5);
    const arr = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return arr[(val % 16)];
  };


  getWeatherData = (coords, date, provider) => new Promise(
    async (resolve, reject) => {
      try {
        let weather;
        switch (provider) {
          case 'NWS':
            weather = await this.getNWSWeatherData(coords, date);
            break;
          default:
            weather = await this.getNWSWeatherData(coords, date);
            break;
        }
        resolve(weather);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    },
  );

  getNWSWeatherData = (coords, date) => new Promise(
    async (resolve, reject) => {
      try {
        const mynws = new NWS();
        const res = await mynws.getWeather(coords, date);

        const nwsMap = {
          description: '$.properties.textDescription',
          temperature: '$.properties.temperature.value',
          temperature_unit: '$.properties.temperature.unitCode',
          dewpoint: '$.properties.dewpoint.value',
          dewpoint_unit: '$.properties.dewpoint.unitCode',
          wind_direction: '$.properties.windDirection.value',
          wind_speed: '$.properties.windSpeed.value',
          wind_speed_unit: '$.properties.windSpeed.unitCode',
          relative_humidity: '$.properties.relativeHumidity.value',
          relative_humidity_unit: '$.properties.relativeHumidity.unitCode',
          windchill: '$.properties.windChill.value',
          windchill_unit: '$.properties.windChill.unitCode',
          heat_index: '$.properties.heatIndex.value',
          heat_index_unit: '$.properties.heatIndex.unitCode',
        };

        const nwsWeather = {};
        let jpArr = [];

        Object.keys(this.weather_props).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(nwsMap, key)) {
            jpArr = JSONPath(nwsMap[key], res);
            if (jpArr.length > 0) {
              if (jpArr[0] !== null) {
                [nwsWeather[key]] = jpArr;
              }
            }
          }
        });

        // normalize
        let v;
        Object.keys(nwsWeather).forEach(async (key) => {
          v = nwsWeather[key];
          if (key === 'wind_direction') {
            if (typeof v === 'number') {
              nwsWeather[key] = this.degToCompass(v);
            } else {
              nwsWeather[key] = 'n/a';
            }
          } else {
            nwsWeather[key] = await mynws.normalizeAttr(v);
          }
        });

        resolve(nwsWeather);
      } catch (err) {
        reject(err);
      }
    },
  );
}

module.exports = MyWeather;
