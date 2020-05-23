const myhelper = require('./webhook-handler');

exports.handler = async (event, context) => {
  try {
    // default success response data
    var response = {
      "statusCode": 200,
      "headers": {
        "Content-Type": "x-www-form-urlencoded"
      },
      "body": ""
    }
    response = await myhelper.webhook(event, response);


    return response;

    // failure response
  } catch (err) {
    console.log("Error during handling of webhook request");
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
