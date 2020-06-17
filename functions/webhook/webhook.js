const debug = require('debug')('rain-or-shine:webhook');
const myhandler = require('./webhook-handler');

exports.handler = async (event) => {
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
    return response;

    // failure response
  } catch (err) {
    console.log('Error during handling of webhook request');
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
