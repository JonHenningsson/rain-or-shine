const debug = require('debug')('rain-or-shine:add-user');
const validator = require('validator');
const MyStrava = require('mystrava');
const MyUserDB = require('myuserdb');
const auth = require('../common/auth');
const Settings = require('../common/settings');


exports.handler = async (event) => {
  debug('Handling add-user request..');
  try {
    // default response data
    let statusCode = 200;
    let statusMessage;

    let accessToken;
    let refreshToken;
    let expiresAt;
    let athleteId;

    // Strava
    // initialize strava object and obtain access token
    try {
      const mys = new MyStrava();
      const stravaGeneric = await mys.stravaV3();

      const { code } = validator.isAlphanumeric && event.queryStringParameters;
      // const { scope } = event.queryStringParameters;
      // const { state } = event.queryStringParameters;

      let payload = await stravaGeneric.oauth.getToken(code);
      accessToken = payload.access_token;
      refreshToken = payload.refresh_token;
      expiresAt = payload.expires_at;

      // initialize new strava object with athlete access
      const strava = new stravaGeneric.client(accessToken);
      payload = await strava.athlete.get({});
      athleteId = payload.id;
    } catch (err) {
      debug('Error when getting strava athlete: %s', err.message);
      throw new Error('Failed to get Strava athlete information');
    }

    try {
      const udb = new MyUserDB();
      let userExists = false;

      // Check if user exists
      try {
        await udb.getUser(
          athleteId,
        );

        userExists = true;
        statusCode = 200;
        statusMessage = 'User already exists';
      } catch (err) {
        if (err.name !== 'NotFound') {
          throw new Error('Failed to get user from db');
        }
      }

      // Save user to DB
      try {
        if (!userExists) {
          const settings = new Settings().default;

          await udb.addUser(
            athleteId,
            accessToken,
            refreshToken,
            expiresAt,
            settings,
          );

          statusCode = 201;
          statusMessage = 'User added';
        }
      } catch (err) {
        throw new Error('Failed to save user to db');
      }
    } catch (err) {
      throw new Error('Failed to add user');
    }

    // HTTP Response
    debug('Handled request successfully');
    return {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': auth.createJwtCookie(athleteId),
      },
      body: JSON.stringify({
        status: 'success',
        message: statusMessage,
      }),
    };
  } catch (err) {
    debug('Error: %O', err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'error',
        message: err.message,
      }),
    };
  }
};
