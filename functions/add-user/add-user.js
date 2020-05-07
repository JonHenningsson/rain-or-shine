//const util = require('util')
const strava_config = require('../strava-config');
const UserDB = require('../userdb');

exports.handler = async (event, context) => {
  try {

    // default response data
    var statusCode = 200;
    var statusMessage;

    // Strava
    // initialize strava object and obtain access token
    try {
      var strava_generic = strava_config.initStrava();

      let code = event.queryStringParameters.code;
      let scope = event.queryStringParameters.scope;
      let state = event.queryStringParameters.state;

      let payload = await strava_generic.oauth.getToken(code);
      var access_token = payload.access_token;
      var refresh_token = payload.refresh_token;
      var expires_at = payload.expires_at;

      // initialize new strava object with athlete access
      var strava = new strava_generic.client(access_token);
      payload = await strava.athlete.get({});
      var athlete_id = payload.id;

    } catch (err) {
      throw "Failed to get Strava athlete information";
    }

    try {
      const udb = new UserDB();

      // Check if user exists
      try {
        var user_exists = false;
        let res = await udb.getUser(
          athlete_id
        );

        user_exists = true;
        statusCode = 200;
        statusMessage = "User already exists";

      } catch (err) {
        if (err.name !== "NotFound") {
          throw "Failed to get user from db";
        }
      }

      // Save user to DB
      try {
        if (!user_exists) {
          res = await udb.addUser(
            athlete_id,
            access_token,
            refresh_token,
            expires_at
          );

          statusCode = 201;
          statusMessage = "User added";

        }
      } catch (err) {
        throw "Failed to save user to db"
      }

    } catch (err) {
      console.log(err);
      throw "Failed to add user";
    }

    // HTTP Response
    return {
      statusCode: statusCode,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "status": "success",
        "message": statusMessage
      })
    }

  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "status": "error",
        "message": err.toString()
      })
    }
  }
}
