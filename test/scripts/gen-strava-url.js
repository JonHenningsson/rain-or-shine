(async function() {

  try {

    let baseurl = process.env.NETLIFY_URL;
    let client_id = process.env.STRAVA_API_CLIENT_ID;

    if (! (baseurl && client_id)) {
      throw "Please set NETLIFY_URL and STRAVA_API_CLIENT_ID";
    }

    let scope = "read,activity:write,activity:read";

    let redirect_uri = `${baseurl}/connect/test`;
    let state = "not_used";

    let url = `https://www.strava.com/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=${scope}&state=${state}`;

    console.log("Strava authorization URL: " + url);


  } catch (err) {
    console.log("== Error ==")
    console.log(err);
    process.exit(1);
  }

}());
