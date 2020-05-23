process.env.NODE_ENV = "test";
let code = process.env.TEST_CODE;
const NETLIFY_URL = process.env.NETLIFY_URL;
const FUNCTION_PATH = "/.netlify/functions/add-user";

if (! (code && NETLIFY_URL)) {
  console.log("Please set TEST_CODE and NETLIFY_URL! Exiting");
  process.exit(1);
}

let chai = require('chai');
let chaiHttp = require('chai-http');
let should = chai.should();

chai.use(chaiHttp);
describe('adduser', () => {

  describe('GET ' + FUNCTION_PATH, () => {
      it('Add user - valid', (done) => {
        chai.request(NETLIFY_URL)
            .get(FUNCTION_PATH)
            .query({
              "code": code,
              "scope": "read,activity:write,activity:read",
              "state": "not_used"
            })
            .end((err, res) => {
                // 200 = existing user, 201 = new user
                res.status.should.be.oneOf([200, 201]);
                res.should.be.json;
                done();
            });
      });
      it('Add user - invalid code', (done) => {
        chai.request(NETLIFY_URL)
            .get(FUNCTION_PATH)
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
