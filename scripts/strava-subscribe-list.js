const MyStrava = require('mystrava');

(async function run() {
  try {
    const mys = new MyStrava();
    const stravaGeneric = await mys.stravaV3();

    try {
      const payload = await stravaGeneric.pushSubscriptions.list();
      console.log('== Success ==');
      console.log('Successfully retrieved subscriptions!');
      console.log(payload);
    } catch (error) {
      throw error.message;
    }
  } catch (err) {
    console.log('== Error ==');
    console.log(err);
    process.exit(1);
  }
}());
