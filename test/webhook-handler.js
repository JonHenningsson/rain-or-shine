process.env.NODE_ENV = "test";
let verify_token = process.env.STRAVA_VERIFY_TOKEN;
const NETLIFY_URL = process.env.NETLIFY_URL;

if (! (verify_token && NETLIFY_URL)) {
  console.log("Please set STRAVA_VERIFY_TOKEN and NETLIFY_URL! Exiting");
  process.exit(1);
}

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('webhook-handler', () => {

  // Verification request tests
  describe('GET /webhook-handler', () => {
      it('Verification request - valid', (done) => {
        let challenge = "15f7d1a91c1f40f8a748fd134752feb3";
        chai.request(NETLIFY_URL)
            .get("/.netlify/functions/webhook-handler")
            .query({
              "hub.mode":"subscribe",
              "hub.challenge": challenge,
              "hub.verify_token": verify_token
            })
            .end((err, res) => {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.eql({"hub.challenge": challenge});
                done();
            });
      });
      it('Verification request - invalid verify token', (done) => {
        let challenge = "15f7d1a91c1f40f8a748fd134752feb3";
        chai.request(NETLIFY_URL)
        .get("/.netlify/functions/webhook-handler")
        .query({
          "hub.mode":"subscribe",
          "hub.challenge": challenge,
          "hub.verify_token": "bogus"
        })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
      });

  });

  // Event tests
  describe('POST /webhook-handler', () => {
      it('create - activity', (done) => {
        chai.request(NETLIFY_URL)
            .post("/.netlify/functions/webhook-handler")
            .query({
              "object_type":"activity",
              "object_id": "154504250376823",
              "aspect_type": "create",
              "owner_id": "14655447",
              "subscription_id": "120475"
            })
            .end((err, res) => {
                res.should.have.status(200);
                done();
            });
      });

  });


});
