process.env.NODE_ENV = 'test';
const { NETLIFY_URL } = process.env;
const { JWT_COOKIE } = process.env;
const FUNCTION_PATH = '/.netlify/functions/manage-settings';

if (!(NETLIFY_URL)) {
  console.log('Please set NETLIFY_URL! Exiting');
  process.exit(1);
}

const chai = require('chai');
const chaiHttp = require('chai-http');

chai.should();

chai.use(chaiHttp);
describe('manage-settings', () => {
  // Settings request tests
  describe(`GET ${FUNCTION_PATH}`, () => {
    it('Get settings request - valid', (done) => {
      if (!(JWT_COOKIE)) {
        console.log('Please set JWT! Exiting');
        process.exit(1);
      }
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .set('Cookie', `${JWT_COOKIE}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('weatherProvider');
          done();
        });
    });

    it('Get settings request - invalid JWT', (done) => {
      chai.request(NETLIFY_URL)
        .get(FUNCTION_PATH)
        .set('Cookie', 'jwt=bogus; Path=/; HttpOnly')
        .end((err, res) => {
          res.should.have.status(403);
          done();
        });
    });

    it('Settings logout request - valid', (done) => {
      if (!(JWT_COOKIE)) {
        console.log('Please set JWT! Exiting');
        process.exit(1);
      }
      chai.request(NETLIFY_URL)
        .get(`${FUNCTION_PATH}?logout`)
        .set('Cookie', `${JWT_COOKIE}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          done();
        });
    });
  });

  // Event webhook tests
  describe(`POST ${FUNCTION_PATH}`, () => {
    it('Save settings request - valid', (done) => {
      if (!(JWT_COOKIE)) {
        console.log('Please set JWT! Exiting');
        process.exit(1);
      }
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type('json')
        .set('Cookie', `${JWT_COOKIE}`)
        .send({
          weatherProvider: 'NWS',
          weatherInfoPlacement: 'before',
          temperatureUnit: '℃',
          heatIndexUnit: '℃',
          windSpeedUnit: 'm/s',
          status: 'active',
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.have.property('weatherProvider');
          done();
        });
    });

    it('Save settings request - invalid', (done) => {
      if (!(JWT_COOKIE)) {
        console.log('Please set JWT! Exiting');
        process.exit(1);
      }
      chai.request(NETLIFY_URL)
        .post(FUNCTION_PATH)
        .type('json')
        .set('Cookie', `${JWT_COOKIE}`)
        .send({
          weatherProvider: 'NWS',
          weatherInfoPlacement: 'before',
          temperatureUnit: 'bogus',
          heatIndexUnit: '℃',
          windSpeedUnit: 'm/s',
          status: 'active',
          bogus: 'bogus',
        })
        .end((err, res) => {
          res.should.have.status(500);
          done();
        });
    });
  });
});
