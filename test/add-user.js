process.env.NODE_ENV = 'test';
const code = process.env.TEST_CODE;
const { NETLIFY_URL } = process.env;
const FUNCTION_PATH = '/.netlify/functions/add-user';

if (!(NETLIFY_URL)) {
  console.log('Please set NETLIFY_URL! Exiting');
  process.exit(1);
}

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();

chai.use(chaiHttp);
describe('adduser', () => {
  describe(`GET ${FUNCTION_PATH}`, () => {
    it('Add user - valid', (done) => {
      if (!(code)) {
        console.log('Please set TEST_CODE! Exiting');
        process.exit(1);
      }
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .query({
          code,
          scope: 'read,activity:write,activity:read',
          state: 'not_used',
        })
        .end((err, res) => {
          // 200 = existing user, 201 = new user
          res.status.should.be.oneOf([200, 201]);
          res.should.be.json;
          console.log(`JWT Cookie: ${res.headers['set-cookie'][0]}`);
          done();
        });
    });
    it('Add user - invalid code', (done) => {
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .query({
          code: 'bogus',
          scope: 'read,activity:write,activity:read',
          state: 'not_used',
        })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });
});
