const MyStrava = require('mystrava');

(async function run() {
  try {
    const myDone = function done() {};

    const subId = process.argv[2];
    if (!subId) {
      throw new Error('Please provide a subscription id');
    }

    const mys = new MyStrava();
    const straveGeneric = await mys.strava_v3();

    await straveGeneric.pushSubscriptions.delete({
      id: subId,
    }, myDone);
    console.log('== Success ==');
    console.log('Successfully deleted subscription!');
  } catch (err) {
    console.log('== Error ==');
    console.log(err);
    process.exit(1);
  }
}());
