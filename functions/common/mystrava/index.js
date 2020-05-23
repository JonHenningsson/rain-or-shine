const strava = require('strava-v3');

const STRAVA_API_CLIENT_ID = process.env.STRAVA_API_CLIENT_ID;
const STRAVA_API_CLIENT_SECRET = process.env.STRAVA_API_CLIENT_SECRET;
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI;


class MyStrava {
  constructor() {
    this.strava = strava;
    this.client_id = STRAVA_API_CLIENT_ID;
    this.client_secret = STRAVA_API_CLIENT_SECRET;
    this.verify_token = STRAVA_VERIFY_TOKEN;
    this.redirect_uri = STRAVA_REDIRECT_URI;

    this.config = {
      "client_id": this.client_id,
      "client_secret": this.client_secret,
      "redirect_uri": this.redirect_uri
    };

    this.strava.config(this.config);
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

  is_activity_create_req = (event) => {
    return new Promise(
      (resolve, reject) => {
        let json = JSON.parse(event.body);
        if (
          event.httpMethod == "POST" &&
          json.object_type == "activity" &&
          json.aspect_type == "create" &&
          json.object_id
        ) {
          resolve(true);
        } else {
          resolve(false);
        }
      }
    )
  };

  updateAccessToken = (refresh_token) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          let payload = await this.strava.oauth.refreshToken(refresh_token);
          resolve(payload);
        } catch (err) {
          reject(err);
        }
      }
    )
  };

  getActivity = (activity_id, access_token) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          let payload = await this.strava.activities.get({
            "id": activity_id,
            "access_token": access_token
          });
          resolve(payload);
        } catch (err) {
          reject(err);
        }
      }
    )
  };

  updateActivity = (activity_id, access_token, data) => {
    return new Promise(
      async (resolve, reject) => {
        try {
          data.id = activity_id;
          data.access_token = access_token;
          let payload = await this.strava.activities.update(data);
          resolve(payload);
        } catch (err) {
          reject(err);
        }
      }
    )
  };

  strava_v3 = () => {
    return new Promise(
      (resolve, reject) => {
        resolve(this.strava);
      }
    )
  };

}

module.exports = MyStrava;
