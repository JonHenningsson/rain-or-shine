const strava = require('strava-v3');

const STRAVA_API_CLIENT_ID = process.env.STRAVA_API_CLIENT_ID;
const STRAVA_API_CLIENT_SECRET = process.env.STRAVA_API_CLIENT_SECRET;
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;


class MyStrava {
  constructor() {
    this.client_id = STRAVA_API_CLIENT_ID;
    this.client_secret = STRAVA_API_CLIENT_SECRET;
    this.verify_token = STRAVA_VERIFY_TOKEN;
    this.redirect_uri = STRAVA_REDIRECT_URI;
  }

  is_validation_req = (event) => {
    return new Promise(
      (resolve, reject) => {
        if (
          event.httpMethod == "GET" &&
          event.queryStringParameters["hub.mode"] == "subscribe" &&
          event.queryStringParameters["hub.challenge"] &&
          event.queryStringParameters["hub.verify_token"]
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    )
  };

  strava_v3 = () => {
    return new Promise(
      (resolve, reject) => {
        strava.config({
          "client_id": this.client_id,
          "client_secret": this.client_secret,
          "redirect_uri": this.redirect_uri
        });
        resolve(strava);
      }
    )
  };

}

module.exports = MyStrava;
