(async function run() {
  try {
    const baseurl = process.env.NETLIFY_URL;
    const clientId = process.env.STRAVA_API_CLIENT_ID;

    if (!(baseurl && clientId)) {
      throw new Error('Please set NETLIFY_URL and STRAVA_API_CLIENT_ID');
    }

    const scope = 'read,activity:write,activity:read';

    const redirectUri = `${baseurl}/connect/test`;
    const state = 'not_used';

    const url = `https://www.strava.com/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;

    console.log(`Strava authorization URL: ${url}`);
  } catch (err) {
    console.log('== Error ==');
    console.log(err);
    process.exit(1);
  }
}());
