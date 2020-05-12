process.env.NODE_ENV = "test";
let code = process.env.TEST_CODE;
const NETLIFY_URL = process.env.NETLIFY_URL;

if (! (code && NETLIFY_URL)) {
  console.log("Please set TEST_CODE and NETLIFY_URL! Exiting");
  process.exit(1);
}

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
//Our parent block
describe('adduser', () => {

  describe('GET /add-user', () => {
      it('Add user - valid', (done) => {
        chai.request(NETLIFY_URL)
            .get("/.netlify/functions/add-user")
            .query({
              "code": code,
              "scope": "read,activity:write,activity:read",
              "state": "not_used"
            })
            .end((err, res) => {
                // 201 = new user, 200 = existing user
                res.should.have.status(200||201);
                res.should.be.json;
                done();
            });
      });
      it('Add user - invalid code', (done) => {
        chai.request(NETLIFY_URL)
            .get("/.netlify/functions/add-user")
            .query({
              "code": "bogus",
              "scope": "read,activity:write,activity:read",
              "state": "not_used"
            })
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
      });
  });

});
