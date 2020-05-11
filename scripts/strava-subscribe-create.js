(async function() {

  try {
    var webhook_handler_path = "/.netlify/functions/webhook-handler";
    var base_url = process.argv[2];
    if (!base_url) {
      throw "Please provide your callback base URL e.g. https://mydomain.example.com"
    }

    const mystrava = require('mystrava');
    const mys = new mystrava();
    var strava_generic = await mys.strava_v3();

    var callback_url = base_url + webhook_handler_path;

    try {
      let payload =
        await strava_generic.pushSubscriptions.create({
          "callback_url": callback_url,
          "verify_token": mys.verify_token
        });
        console.log("== Success ==");
        console.log("Successfully created subscription!");
        console.log(payload);

    } catch (error) {
      throw error.message
    }

  } catch (err) {
    console.log("== Error ==")
    console.log(err);
    process.exit(1);
  }

}());
