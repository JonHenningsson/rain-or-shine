const debug = require('debug')('rain-or-shine:MyStrava');
const strava = require('strava-v3');

const sdebug = debug.extend('sensitive');

const { STRAVA_API_CLIENT_ID } = process.env;
const { STRAVA_API_CLIENT_SECRET } = process.env;
const { STRAVA_VERIFY_TOKEN } = process.env;
const { STRAVA_REDIRECT_URI } = process.env;

debug('STRAVA_API_CLIENT_ID: %s', STRAVA_API_CLIENT_ID);
sdebug('STRAVA_API_CLIENT_SECRET: %s', STRAVA_API_CLIENT_SECRET);
sdebug('STRAVA_VERIFY_TOKEN: %s', STRAVA_VERIFY_TOKEN);
debug('STRAVA_REDIRECT_URI: %s', STRAVA_REDIRECT_URI);

class MyStrava {
  constructor() {
    const edebug = debug.extend('constructor');
    edebug('Constructor');
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
      const edebug = debug.extend('isValidationReq');
      edebug('Evaluating request..');
      if (
        event.httpMethod === 'GET'
          && event.queryStringParameters['hub.mode'] === 'subscribe'
          && event.queryStringParameters['hub.challenge']
          && event.queryStringParameters['hub.verify_token']
      ) {
        edebug('True!');
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  isActivityCreateReq = (event) => new Promise(
    (resolve) => {
      const edebug = debug.extend('isActivityCreateReq');
      edebug('Evaluating request..');
      const json = JSON.parse(event.body);
      if (
        event.httpMethod === 'POST'
          && json.object_type === 'activity'
          && json.aspect_type === 'create'
          && json.object_id
      ) {
        edebug('True!');
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  isAthleteUpdateAuthFalseReq = (event) => new Promise(
    (resolve) => {
      const edebug = debug.extend('isAthleteUpdateAuthFalseReq');
      edebug('Evaluating request..');
      const json = JSON.parse(event.body);
      if (
        event.httpMethod === 'POST'
          && json.object_type === 'athlete'
          && json.aspect_type === 'update'
          && json.object_id === json.owner_id
          && json.updates.authorized === 'false'
      ) {
        edebug('True!');
        resolve(true);
      } else {
        resolve(false);
      }
    },
  );

  updateAccessToken = (refreshToken) => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('updateAccessToken');
      try {
        edebug('Attempting to update access token with refreshToken: %s', refreshToken);
        const payload = await this.strava.oauth.refreshToken(refreshToken);
        resolve(payload);
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );

  getActivity = (activityId, accessToken) => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('getActivity');
      try {
        edebug('Attempting to get activity for activityId: %s', activityId);
        const payload = await this.strava.activities.get({
          id: activityId,
          access_token: accessToken,
        });
        edebug('Success: %O', payload);
        resolve(payload);
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );

  updateActivity = (activityId, accessToken, data) => new Promise(
    async (resolve, reject) => {
      const edebug = debug.extend('updateActivity');
      try {
        const dataNew = data;
        dataNew.id = activityId;
        dataNew.access_token = accessToken;
        edebug('Attempting to update activity with data: %O', dataNew);
        const payload = await this.strava.activities.update(dataNew);
        edebug('Success!');
        resolve(payload);
      } catch (err) {
        edebug('Failed: %s', err.message);
        reject(err);
      }
    },
  );

  stravaV3 = () => new Promise(
    (resolve) => {
      const edebug = debug.extend('stravaV3');
      edebug('Returning strava object..');
      resolve(this.strava);
    },
  );
}

module.exports = MyStrava;
