const debug = require('debug')('rain-or-shine:Settings');
class Settings {
  constructor() {
    this.available = {
      weatherProvider: {
        description: 'Weather data source',
        name: 'Weather provider',
        available: ['NWS'],
        default: 'NWS',
      },
      weatherInfoPlacement: {
        description: 'Place weather information before or after existing description',
        name: 'Weather info placement',
        available: ['before', 'after'],
        default: 'before',
      },
      temperatureUnit: {
        description: 'Unit to use for temperature',
        name: 'Temperature unit',
        available: ['℃', '℉', 'K'],
        default: '℃',
      },
      heatIndexUnit: {
        description: 'Unit to use for "feels like" temperature',
        name: 'Feels like temperature unit',
        available: ['℃', '℉', 'K'],
        default: '℃',
      },
      windSpeedUnit: {
        description: 'Unit to use for wind speed',
        name: 'Wind speed unit',
        available: ['m/s', 'mph', 'km/h', 'kn'],
        default: 'm/s',
      },
      status: {
        description: 'Enable or disable service for your activities',
        name: 'Status',
        available: ['active', 'paused'],
        default: 'active',
      },
    };

    this.weatherProps = {
      description: 'Weather description',
      temperature: 'Temperature',
      temperatureUnit: 'Temperature unit',
      dewpoint: 'Dewpoint',
      dewpointUnit: 'Dewpoint unit',
      windDirection: 'Wind direction',
      windSpeed: 'Wind speed',
      windSpeedUnit: 'Wind speed unit',
      relativeHumidity: 'Relative humidity',
      relativeHumidityUnit: 'Relative humidity unit',
      windchill: 'Windchill',
      windchillUnit: 'Windchill unit',
      heatIndex: 'Heat index',
      heatIndexUnit: 'Heat index unit',
    };

    this.default = {
      weatherProvider: this.available.weatherProvider.default,
      weatherInfoPlacement: this.available.weatherInfoPlacement.default,
      temperatureUnit: this.available.temperatureUnit.default,
      heatIndexUnit: this.available.heatIndexUnit.default,
      windSpeedUnit: this.available.windSpeedUnit.default,
      status: this.available.status.default,
    };
  }

  isValid = (settings) => new Promise(
    (resolve) => {
      try {
        if (typeof settings === 'object') {
          let availableArr;
          // validate all known settings
          Object.keys(this.available).forEach(async (key) => {
            if (Object.prototype.hasOwnProperty.call(settings, key)) {
              availableArr = this.available[key].available;
              if (!(availableArr.includes(settings[key]))) {
                resolve(false);
              }
            }
          });

          // check if settings contains unknown keys
          Object.keys(settings).forEach(async (key) => {
            if (!(Object.prototype.hasOwnProperty.call(this.available, key))) {
              resolve(false);
            }
          });

          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        resolve(false);
      }
    },
  );
}

module.exports = Settings;
