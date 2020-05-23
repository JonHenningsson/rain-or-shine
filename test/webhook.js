process.env.NODE_ENV = "test";
let verify_token = process.env.STRAVA_VERIFY_TOKEN;
let owner_id = process.env.OWNER_ID;
let activity_id = process.env.ACTIVITY_ID;
const NETLIFY_URL = process.env.NETLIFY_URL;
const FUNCTION_PATH = "/.netlify/functions/webhook";

if (!(NETLIFY_URL)) {
  console.log("Please set NETLIFY_URL! Exiting");
  process.exit(1);
}

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
describe('webhook', () => {

  // Verification request tests
  describe('GET ' + FUNCTION_PATH, () => {
    it('Verification request - valid', (done) => {
      if (!(verify_token)) {
        console.log("Please set STRAVA_VERIFY_TOKEN! Exiting");
        process.exit(1);
      }
      let challenge = "15f7d1a91c1f40f8a748fd134752feb3";
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .query({
          "hub.mode": "subscribe",
          "hub.challenge": challenge,
          "hub.verify_token": verify_token
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.eql({
            "hub.challenge": challenge
          });
          done();
        });
    });
    it('Verification request - invalid verify token', (done) => {
      if (!(verify_token)) {
        console.log("Please set STRAVA_VERIFY_TOKEN! Exiting");
        process.exit(1);
      }
      let challenge = "15f7d1a91c1f40f8a748fd134752feb3";
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .query({
          "hub.mode": "subscribe",
          "hub.challenge": challenge,
          "hub.verify_token": "bogus"
        })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

  });

  // Event webhook tests
  describe('POST ' + FUNCTION_PATH, () => {
    it('create - activity', (done) => {
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type("json")
        .send({
          "object_type": "activity",
          "object_id": activity_id,
          "aspect_type": "create",
          "owner_id": owner_id,
          "subscription_id": "120475"
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('create - activity - invalid owner id', (done) => {
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type("json")
        .send({
          "object_type": "activity",
          "object_id": activity_id,
          "aspect_type": "create",
          "owner_id": "123456",
          "subscription_id": "120475"
        })
        .end((err, res) => {
          res.should.have.status(200);
          done();
        });
    });

    it('create - activity - invalid activity id', (done) => {
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type("json")
        .send({
          "object_type": "activity",
          "object_id": "344095243500000000",
          "aspect_type": "create",
          "owner_id": owner_id,
          "subscription_id": "120475"
        })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });

    it('bogus event', (done) => {
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type("json")
        .send({
          "who": "dog",
          "response": "this is dog"
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.not.be.json;
          done();
        });
    });

  });


});
