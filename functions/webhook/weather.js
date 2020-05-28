const {
  JSONPath
} = require('jsonpath-plus');
const NWS = require('./nws');

class MyWeather {
  constructor() {
    this.weather_props = {
      "description": "Weather description",
      "temperature": "Temperature",
      "temperature_unit": "Temperature unit",
      "dewpoint": "Dewpoint",
      "dewpoint_unit": "Dewpoint unit",
      "wind_direction": "Wind direction",
      "wind_speed": "Wind speed",
      "wind_speed_unit": "Wind speed unit",
      "relative_humidity": "Relative humidity",
      "relative_humidity_unit": "Relative humidity unit",
      "windchill": "Temperature unit",
      "windchill_unit": "Windchill unit",
      "heat_index": "Heat index",
      "heat_index_unit": "Heat index unit"
    };
  }

  degToCompass = (degrees) => {
    degrees = Math.round(degrees);
    var val = Math.floor((degrees / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
  };


  getWeatherData = (coords, date, provider) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          let weather;
          switch (provider) {
            case "NWS":
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
      }
    )
  };

  getNWSWeatherData = (coords, date) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          let mynws = new NWS();
          let res = await mynws.getWeather(coords, date);

          let nws_map = {
            "description": "$.properties.textDescription",
            "temperature": "$.properties.temperature.value",
            "temperature_unit": "$.properties.temperature.unitCode",
            "dewpoint": "$.properties.dewpoint.value",
            "dewpoint_unit": "$.properties.dewpoint.unitCode",
            "wind_direction": "$.properties.windDirection.value",
            "wind_speed": "$.properties.windSpeed.value",
            "wind_speed_unit": "$.properties.windSpeed.unitCode",
            "relative_humidity": "$.properties.relativeHumidity.value",
            "relative_humidity_unit": "$.properties.relativeHumidity.unitCode",
            "windchill": "$.properties.windChill.value",
            "windchill_unit": "$.properties.windChill.unitCode",
            "heat_index": "$.properties.heatIndex.value",
            "heat_index_unit": "$.properties.heatIndex.unitCode"
          }

          let nws_weather = {};
          let jp_arr = [];

          for (var key in this.weather_props) {
            if (this.weather_props.hasOwnProperty(key)) {
              if (nws_map.hasOwnProperty(key)) {
                jp_arr = JSONPath(nws_map[key], res);
                if (jp_arr.length > 0) {
                  if (jp_arr[0] !== null) {
                    nws_weather[key] = jp_arr[0];
                  }
                }
              }
            }
          }

          // normalize
          let v;
          for (var key in nws_weather) {
            if (nws_weather.hasOwnProperty(key)) {
              v = nws_weather[key];

              if (key == "wind_direction") {
                if (typeof(v) == "number") {
                  nws_weather[key] = this.degToCompass(v);
                } else {
                  nws_weather[key] = "n/a";
                }

              } else {
                nws_weather[key] = await mynws.normalizeAttr(v);
              }

            }
          }

          resolve(nws_weather);

        } catch (err) {
          reject(err);
        }
      }
    )
  };


}

module.exports = MyWeather;
