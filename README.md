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
  - Set environment variable FAUNADB_API_SERVER_SECRET to SERVER KEY

4. Setup Strava integration
  - Create a new API application and note down Client ID and Client Secret
  - Set environment variables:
    - STRAVA_API_CLIENT_ID to Client ID
    - STRAVA_API_CLIENT_SECRET to Client Secret
    - HUGO_PARAMS_STRAVA_CID to Client ID

5. Set the environment variables
```
export FAUNADB_API_SERVER_SECRET=your_fauna_server_secret HUGO_PARAMS_STRAVA_CID=your_strava_client_id STRAVA_API_CLIENT_ID=your_strava_client_id STRAVA_API_CLIENT_SECRET=your_strava_client_secret
```


5. Run project locally
  - yarn run netlify dev --context=development

3. Netlify Dev locally
  - yarn install
  - netlify link / init
  - Uncomment cb_base_url in config.toml
  - netlify dev
