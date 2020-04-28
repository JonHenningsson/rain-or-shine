exports.handler = async (event, context) => {
  try {
    //const timetable = new TimeTable2Departing(process.env.resrobot_timetable_api_key);
    //let stopid = event.queryStringParameters.stopid;

    //let timetable_result = await timetable.timetable(stopid);
    console.log("do stuff");

    return {
      statusCode: 200,
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({"status":"success"})
    }

  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}
