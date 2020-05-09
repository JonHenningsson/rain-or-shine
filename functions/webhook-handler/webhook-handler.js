const strava = require('strava-v3')

exports.handler = async (event, context) => {
  try {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))

    return {
      statusCode: 200,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({"status":"success"})
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
