const debug = require('debug')('MyStrava');
const strava = require('strava-v3');

const { STRAVA_API_CLIENT_ID } = process.env;
const { STRAVA_API_CLIENT_SECRET } = process.env;
const { STRAVA_VERIFY_TOKEN } = process.env;
const { STRAVA_REDIRECT_URI } = process.env;


class MyStrava {
  constructor() {
    this.strava = strava;
    this.client_id = STRAVA_API_CLIENT_ID;
    this.client_secret = STRAVA_API_CLIENT_SECRET;
    this.verify_token = STRAVA_VERIFY_TOKEN;
    this.redirect_uri = STRAVA_REDIRECT_URI;

    this.config = {
      client_id: this.client_id,
      client_secret: this.client_secret,
      redirect_uri: this.redirect_uri,
    };

    this.strava.config(this.config);
  }

  isValidationReq = (event) => new Promise(
    (resolve) => {
      if (
        event.httpMethod === 'GET'
          && event.queryStringParameters['hub.mode'] === 'subscribe'
          && event.queryStringParameters['hub.challenge']
          && event.queryStringParameters['hub.verify_token']
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  isActivityCreateReq = (event) => new Promise(
    (resolve) => {
      const json = JSON.parse(event.body);
      if (
        event.httpMethod === 'POST'
          && json.object_type === 'activity'
          && json.aspect_type === 'create'
          && json.object_id
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  isAthleteUpdateAuthFalseReq = (event) => new Promise(
    (resolve) => {
      const json = JSON.parse(event.body);
      if (
        event.httpMethod === 'POST'
          && json.object_type === 'athlete'
          && json.aspect_type === 'update'
          && json.object_id === json.owner_id
          && json.updates.authorized === 'false'
      ) {
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  updateAccessToken = (refreshToken) => new Promise(
    async (resolve, reject) => {
      try {
        const payload = await this.strava.oauth.refreshToken(refreshToken);
        resolve(payload);
      } catch (err) {
        reject(err);
      }
    },
  );

  getActivity = (activityId, accessToken) => new Promise(
    async (resolve, reject) => {
      try {
        const payload = await this.strava.activities.get({
          id: activityId,
          access_token: accessToken,
        });
        resolve(payload);
      } catch (err) {
        reject(err);
      }
    },
  );

  updateActivity = (activityId, accessToken, data) => new Promise(
    async (resolve, reject) => {
      try {
        const dataNew = data;
        dataNew.id = activityId;
        dataNew.access_token = accessToken;
        const payload = await this.strava.activities.update(dataNew);
        resolve(payload);
      } catch (err) {
        reject(err);
      }
    },
  );

  stravaV3 = () => new Promise(
    (resolve) => {
      resolve(this.strava);
    },
  );
}

module.exports = MyStrava;
