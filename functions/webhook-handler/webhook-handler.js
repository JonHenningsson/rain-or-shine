const mystrava = require('mystrava');

exports.handler = async (event, context) => {
  try {
    // default response data
    var response = {
      "statusCode": 200
    }

    var verify_token_req = event.queryStringParameters["hub.verify_token"];
    var challenge = event.queryStringParameters["hub.challenge"];

    const mys = new mystrava();
    if (await mys.is_validation_req(event)) {

      if (verify_token_req == mys.verify_token) {
        console.log("Valid validation request!");
        response.headers = {
            "Content-Type": "application/json"
          },
          response.body = JSON.stringify({
            "hub.challenge": challenge
          });
      } else {
        throw "Verify token incorrect";
      }

    } else {
      console.log("Not a validation request!");
    }

    // success response
    return response

    // failure response
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "status": "error"
      })
    }
  }
}
