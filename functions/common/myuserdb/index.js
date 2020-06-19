const debug = require('debug')('rain-or-shine:MyUserDB');
const faunadb = require('faunadb');

const sdebug = debug.extend('sensitive');

const q = faunadb.query;

const FAUNADB_API_SERVER_SECRET = process.env.FAUNADB_API_SERVER_SECRET
  || process.env.FAUNADB_API_ADMIN_SECRET;
const FAUNADB_COLLECTION_USERS = 'User';
const FAUNADB_COLLECTION_USERS_INDEX = 'user_unique_athleteId';

sdebug('FAUNADB_API_SERVER_SECRET: %s', FAUNADB_API_SERVER_SECRET);
debug('FAUNADB_COLLECTION_USERS: %s', FAUNADB_COLLECTION_USERS);
debug('FAUNADB_COLLECTION_USERS_INDEX: %s', FAUNADB_COLLECTION_USERS_INDEX);

class MyUserDB {
  constructor() {
    const edebug = debug.extend('constructor');
    edebug('Constructor');
    this.apikey = FAUNADB_API_SERVER_SECRET;
    this.serverClient = new faunadb.Client({
      secret: this.apikey,
    });
  }

  addUser = (
    athleteId,
    accessToken,
    refreshToken,
    expiresAt,
    settings,
  ) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('addUser');
      edebug('Attempting to create DB entry..');
      this.serverClient.query(
        q.Create(
          q.Collection(FAUNADB_COLLECTION_USERS), {
            data: {
              athleteId,
              accessToken,
              refreshToken,
              expiresAt,
              settings,
            },
          },
        ),
      )
        .then(
          (res) => {
            edebug('Success: %O', res);
            resolve(res);
          },
          (rej) => {
            edebug('Failed: %O', rej);
            reject(rej);
          },
        );
    },
  );

  getUser = (athleteId) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('getUser');
      edebug('Attempting to get user for athleteId: %s..', athleteId);
      this.serverClient.query(
        q.Get(
          q.Match(q.Index(FAUNADB_COLLECTION_USERS_INDEX), athleteId),
        ),
      )
        .then(
          (res) => {
            edebug('Success: %O', res);
            resolve(res);
          },
          (rej) => {
            edebug('Failed: %O', rej);
            reject(rej);
          },
        );
    },
  );

  delUser = (ref) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('delUser');
      edebug('Attempting to delete user for ref: %s..', ref);
      this.serverClient.query(
        q.Delete(
          ref,
        ),
      )
        .then(
          (res) => {
            edebug('Success: %O', res);
            resolve(res);
          },
          (rej) => {
            edebug('Failed: %O', rej);
            reject(rej);
          },
        );
    },
  );

  updateTokenInfo = (
    ref,
    accessToken,
    refreshToken,
    expiresAt,
  ) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('updateTokenInfo');
      edebug('Attempting to update DB entry for ref: %s..', ref);
      this.serverClient.query(
        q.Update(
          ref, {
            data: {
              accessToken,
              refreshToken,
              expiresAt,
            },
          },
        ),
      )
        .then(
          (res) => {
            edebug('Success: %O', res);
            resolve(res);
          },
          (rej) => {
            edebug('Failed: %O', rej);
            reject(rej);
          },
        );
    },
  );

  updateSettings = (
    ref,
    settings,
  ) => new Promise(
    (resolve, reject) => {
      const edebug = debug.extend('updateSettings');
      edebug('Attempting to update DB entry for ref: %s..', ref);
      this.serverClient.query(
        q.Update(
          ref, {
            data: {
              settings,
            },
          },
        ),
      )
        .then(
          (res) => {
            edebug('Success: %O', res);
            resolve(res);
          },
          (rej) => {
            edebug('Failed: %O', rej);
            reject(rej);
          },
        );
    },
  );
}

module.exports = MyUserDB;
