(async function() {
  const mystrava = require('mystrava');

  const mys = new mystrava();
  var strava_generic = await mys.strava_v3();

  var callback_url = "https://rain-or-shine.henningsson.tech" + "/.netlify/functions/webhook-handler";

  try {
  let payload =
    await strava_generic.pushSubscriptions.create({
      "callback_url": callback_url,
      "verify_token": mys.verify_token
    });
  //var access_token = payload.access_token;
  //var refresh_token = payload.refresh_token;
  //var expires_at = payload.expires_at;

  console.log("subscriptions create request response: " + payload);
} catch (error) {
  console.log("Failed! " + error);
}

  // initialize new strava object with athlete access
  /*var strava = new strava_generic.client(access_token);
  payload = await strava.athlete.get({});
  var athlete_id = payload.id;*/

}());
