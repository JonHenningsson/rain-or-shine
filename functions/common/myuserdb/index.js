var faunadb = require('faunadb'),
  q = faunadb.query;

const FAUNADB_API_SERVER_SECRET = process.env.FAUNADB_API_SERVER_SECRET
  || process.env.FAUNADB_API_ADMIN_SECRET;
const FAUNADB_API_ADMIN_SECRET = process.env.FAUNADB_API_ADMIN_SECRET;
const FAUNADB_COLLECTION_USERS = "User";
const FAUNADB_COLLECTION_USERS_INDEX = "user_unique_athlete_id";

class UserDB {
  constructor() {
    this.apikey = FAUNADB_API_SERVER_SECRET;
    this.serverClient = new faunadb.Client({
      secret: this.apikey
    });
  }

  addUser = (
    athlete_id,
    access_token,
    refresh_token,
    expires_at
  ) => {
    return new Promise(
      (resolve, reject) => {
        this.serverClient.query(
            q.Create(
              q.Collection(FAUNADB_COLLECTION_USERS), {
                data: {
                  athlete_id: athlete_id,
                  access_token: access_token,
                  refresh_token: refresh_token,
                  expires_at: expires_at
                }
              },
            )
          )
          .then(
            (res) => {
              resolve(res);
            },
            (rej) => {
              reject(rej);
            });
      }
    )

  };

  getUser = (athlete_id) => {
    return new Promise(
      (resolve, reject) => {
        this.serverClient.query(
            q.Get(
              q.Match(q.Index(FAUNADB_COLLECTION_USERS_INDEX), athlete_id)
            )
          )
          .then(
            (res) => {
              resolve(res);
            },
            (rej) => {
              reject(rej);
            });
      }
    )

  };

  delUser = (athlete_id) => {
    return new Promise(
      (resolve, reject) => {
        this.serverClient.query(
            q.Delete(
              q.Match(q.Index(FAUNADB_COLLECTION_USERS_INDEX), athlete_id)
            )
          )
          .then(
            (res) => {
              resolve(res);
            },
            (rej) => {
              reject(rej);
            });
      }
    )

  };


}

module.exports = UserDB;
