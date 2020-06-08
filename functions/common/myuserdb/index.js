const faunadb = require('faunadb');

const q = faunadb.query;

const FAUNADB_API_SERVER_SECRET = process.env.FAUNADB_API_SERVER_SECRET
  || process.env.FAUNADB_API_ADMIN_SECRET;
const FAUNADB_COLLECTION_USERS = 'User';
const FAUNADB_COLLECTION_USERS_INDEX = 'user_unique_athleteId';

class MyUserDB {
  constructor() {
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
  ) => new Promise(
    (resolve, reject) => {
      this.serverClient.query(
        q.Create(
          q.Collection(FAUNADB_COLLECTION_USERS), {
            data: {
              athleteId,
              accessToken,
              refreshToken,
              expiresAt,
            },
          },
        ),
      )
        .then(
          (res) => {
            resolve(res);
          },
          (rej) => {
            reject(rej);
          },
        );
    },
  );

  getUser = (athleteId) => new Promise(
    (resolve, reject) => {
      this.serverClient.query(
        q.Get(
          q.Match(q.Index(FAUNADB_COLLECTION_USERS_INDEX), athleteId),
        ),
      )
        .then(
          (res) => {
            resolve(res);
          },
          (rej) => {
            reject(rej);
          },
        );
    },
  );

  delUser = (ref) => new Promise(
    (resolve, reject) => {
      this.serverClient.query(
        q.Delete(
          ref,
        ),
      )
        .then(
          (res) => {
            resolve(res);
          },
          (rej) => {
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
            resolve(res);
          },
          (rej) => {
            reject(rej);
          },
        );
    },
  );
}

module.exports = MyUserDB;
