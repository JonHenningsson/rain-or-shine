const debug = require('debug')('rain-or-shine:auth');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const validator = require('validator');

const sdebug = debug.extend('sensitive');

const { JWT_SECRET } = process.env;
const COOKIE_NAME = 'jwt';

sdebug('JWT_SECRET: %s', JWT_SECRET);
debug('COOKIE_NAME: %s', COOKIE_NAME);

function clearJwtCookie() {
  const edebug = debug.extend('clearJwtCookie');
  const expiredCookie = `${COOKIE_NAME}=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  edebug('Expired cookie: %s', expiredCookie);

  return expiredCookie;
}

function createJwtCookie(athleteId) {
  const edebug = debug.extend('createJwtCookie');
  const token = jwt.sign({ athleteId }, JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: '60 days',
  });

  const jwtCookie = cookie.serialize(COOKIE_NAME, token, {
    secure: process.env.NETLIFY_DEV !== 'true',
    httpOnly: true,
    path: '/',
  });
  edebug('New serialized cookie: %s', jwtCookie);

  return jwtCookie;
}

function isAuthenticated(headers) {
  const edebug = debug.extend('isAuthenticated');
  let r = false;
  const cookies = headers.cookie && cookie.parse(headers.cookie);
  edebug('Got cookies:  %O', cookies);
  if (cookies && validator.isJWT(cookies[COOKIE_NAME])) {
    try {
      edebug('Attempting to verify jwt token');
      r = jwt.verify(cookies[COOKIE_NAME], JWT_SECRET);
    } catch (err) {
      edebug('JWT verification failed: %s', err.message);
    }
  }
  edebug('Decoded jwt:  %O', r);
  return r.athleteId;
}


module.exports.createJwtCookie = createJwtCookie;
module.exports.clearJwtCookie = clearJwtCookie;
module.exports.isAuthenticated = isAuthenticated;
