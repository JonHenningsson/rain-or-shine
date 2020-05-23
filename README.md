# rain-or-shine

rain-or-shine is a weather app for Strava

## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

- Strava account
- FaunaDB account
- git
- yarn
- node

```
Give examples
```

### Setup & Run Locally
1. Clone the repository

```
git clone https://github.com/JonHenningsson/rain-or-shine.git
```

2. Enter the repo and install the dependencies

```
cd rain-or-shine && yarn install
```

3. Setup FaunaDB integration
  - Create a new database
  - Create a new collection User
  - Create a new index "user_unique_athlete_id", terms = "data.athlete_id", Unique = checked
  - Create a new SERVER KEY

4. Setup Strava integration
  - Create a new API application and note down Client ID and Client Secret

5. Set the environment variables
```
export FAUNADB_API_SERVER_SECRET=your_fauna_server_secret STRAVA_API_CLIENT_ID=your_strava_client_id STRAVA_API_CLIENT_SECRET=your_strava_client_secret
```

6. If you need to create subscriptions, set STRAVA_VERIFY_TOKEN:
```
export STRAVA_VERIFY_TOKEN=12345
```

5. Run project locally

Now you can run it locally and test the authentication
```
yarn run netlify dev
```


## Running the tests

jon@SL2DEB:~/git/rain-or-shine$ export NETLIFY_URL="http://localhost:8888"
jon@SL2DEB:~/git/rain-or-shine$ export STRAVA_API_CLIENT_ID=46844

jon@SL2DEB:~/git/rain-or-shine$ yarn geturl

Visit URL, login with Strava and then copy code from browser url

jon@SL2DEB:~/git/rain-or-shine$ export TEST_CODE=978dc6dd236cf546ea7a674558f039dd3054d1cf
jon@SL2DEB:~/git/rain-or-shine$ export STRAVA_VERIFY_TOKEN=12345


yarn test




Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

### And coding style tests

Explain what these tests test and why

```
Give an example
```

####

- test add user
- test create subscription request webhook handler
- test new event activity

- environment variables for tests of activity id and athlete id
