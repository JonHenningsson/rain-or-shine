const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const validator = require('validator');

const { JWT_SECRET } = process.env;
const COOKIE_NAME = 'jwt';

function clearJwtCookie() {
  return `${COOKIE_NAME}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function createJwtCookie(athleteId) {
  const token = jwt.sign({ athleteId }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '60 days',
  });

  const jwtCookie = cookie.serialize(COOKIE_NAME, token, {
    secure: process.env.NETLIFY_DEV !== 'true',
    httpOnly: true,
    path: '/',
  });

  return jwtCookie;
}

function isAuthenticated(headers) {
  let r = false;
  const cookies = headers.cookie && cookie.parse(headers.cookie);
  if (cookies && validator.isJWT(cookies[COOKIE_NAME])) {
    try {
      r = jwt.verify(cookies[COOKIE_NAME], JWT_SECRET);
    } catch (err) {
      console.log(err.message);
    }
  }
  return r.athleteId;
}


module.exports.createJwtCookie = createJwtCookie;
module.exports.clearJwtCookie = clearJwtCookie;
module.exports.isAuthenticated = isAuthenticated;
