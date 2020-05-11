const mystrava = require('mystrava');

exports.handler = async (event, context) => {
  try {

    // default response data
    var statusCode = 200;
    var body;

    var verify_token_req = event.queryStringParameters.hub.verify_token
    const mys = new mystrava();


    if (mys.is_validation_req(event)) {
      if (verify_token_req == mys.verify_token) {
        console.log("Valid validation request!");
      }

    }

    console.log("EVENT: \n" + JSON.stringify(event, null, 2))

    return {
      statusCode: statusCode,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        "status": "success",
        "message": statusMessage
      })
    }

  } catch (err) {
    console.log(err);
    return { statusCode: 500, body: err.toString() }
  }
}
