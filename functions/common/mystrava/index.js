const strava = require('strava-v3');

function initStrava() {
  strava.config({
    "client_id": process.env.STRAVA_API_CLIENT_ID,
    "client_secret": process.env.STRAVA_API_CLIENT_SECRET
  });
  return strava;
}

module.exports.initStrava = initStrava;
