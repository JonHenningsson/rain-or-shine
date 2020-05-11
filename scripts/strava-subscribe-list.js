(async function() {

  try {

    const mystrava = require('mystrava');
    const mys = new mystrava();
    var strava_generic = await mys.strava_v3();

    try {
      let payload = await strava_generic.pushSubscriptions.list();
      console.log("== Success ==");
      console.log("Successfully retrieved subscriptions!");
      console.log(payload);
    } catch (error) {
      throw error.message;
    }

  } catch (err) {
    console.log("== Error ==")
    console.log(err);
    process.exit(1);
  }

}());
