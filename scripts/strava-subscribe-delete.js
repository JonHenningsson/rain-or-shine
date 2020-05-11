(async function() {

  try {

    var myDone = function(){};

    var sub_id = process.argv[2];
    if (!sub_id) {
      throw "Please provide a subscription id"
    }

    const mystrava = require('mystrava');
    const mys = new mystrava();
    var strava_generic = await mys.strava_v3();

    try {
      let payload = await strava_generic.pushSubscriptions.delete({
        "id": sub_id
      }, myDone);
      console.log("== Success ==");
      console.log("Successfully deleted subscription!");
    } catch (error) {
      throw error.message;
    }

  } catch (err) {
    console.log("== Error ==")
    console.log(err);
    process.exit(1);
  }

}());
