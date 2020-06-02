const MyStrava = require('mystrava');

(async function run() {
  try {
    const webhookHandlerPath = '/.netlify/functions/webhook';
    const baseUrl = process.argv[2];
    if (!baseUrl) {
      throw new Error('Please provide your callback base URL e.g. https://mydomain.example.com');
    }

    const mys = new MyStrava();
    const stravaGeneric = await mys.strava_v3();

    const callbackUrl = baseUrl + webhookHandlerPath;

    const payload = await stravaGeneric.pushSubscriptions.create({
      callbackUrl,
      verify_token: mys.verify_token,
    });
    console.log('== Success ==');
    console.log('Successfully created subscription!');
    console.log(payload);
  } catch (err) {
    console.log('== Error ==');
    console.log(err);
    process.exit(1);
  }
}());
