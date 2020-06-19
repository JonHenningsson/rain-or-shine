const debug = require('debug')('rain-or-shine:webhook');
const myhandler = require('./webhook-handler');

exports.handler = async (event) => {
  debug('Handling webhook request..');
  try {
    // default success response data
    let response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'x-www-form-urlencoded',
      },
      body: '',
    };

    response = await myhandler.webhook(event, response);
    debug('HTTP response: %O', response);
    return response;

    // failure response
  } catch (err) {
    debug('Error during handling of request: %O', err);
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
