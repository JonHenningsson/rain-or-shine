const debug = require('debug')('rain-or-shine:manage-settings');
const auth = require('../common/auth');
const settingsHandler = require('./settings-handler');

exports.handler = async (event) => {
  debug('Handling manage-settings request..');
  try {
    // default success response data
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {},
    };

    const athleteId = auth.isAuthenticated(event.headers);

    if (!athleteId) {
      debug('Not authenticated');
      response.statusCode = 403;
    }

    if (athleteId) {
      let res;
      // get settings
      if (event.httpMethod === 'GET') {
        if (Object.prototype.hasOwnProperty.call(event.queryStringParameters, 'logout')) {
          response.headers['Set-Cookie'] = auth.clearJwtCookie();
          response.body.status = 'success';
        } else {
          res = await settingsHandler.getSettings(athleteId);
          if (res) {
            response.body = res;
          } else {
            throw new Error('Unable to get settings');
          }
        }
      } else if (event.httpMethod === 'POST') {
        const settings = JSON.parse(event.body);
        res = await settingsHandler.saveSettings(athleteId, settings);
        if (res) {
          response.body = res;
        } else {
          throw new Error('Unable to save settings');
        }
      } else {
        throw new Error('Unknown method');
      }
    }

    response.body = JSON.stringify(response.body);
    return response;

    // failure response
  } catch (err) {
    console.log('Error during handling of settings request');
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'error',
      }),
    };
  }
};
