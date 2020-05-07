const strava = require('strava-v3')

exports.handler = async (event, context) => {
  try {
    const payload = await strava.athlete.get({});
    console.log(payload);


    console.log("do stuff");

    return {
      statusCode: 200,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({"status":"success"})
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
