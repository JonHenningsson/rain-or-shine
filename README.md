# rain-or-shine

## Setup

1. Setup FaunaDB integration
  - Create a new database
  - Create a new collection User
  - Create a new index "user_unique_athlete_id", terms = "data.athlete_id", Unique = checked
  - Create a new SERVER KEY
  - Set environment variable FAUNADB_API_SERVER_SECRET to SERVER KEY

2. Setup Strava integration
  - Create a new API application and note down Client ID and Client Secret
  - Set environment variables:
    - STRAVA_API_CLIENT_ID to Client ID
    - STRAVA_API_CLIENT_SECRET to Client Secret
    - HUGO_PARAMS_STRAVA_CID to Client ID


3. Netlify Dev locally
  - yarn install
  - netlify link / init
  - Uncomment cb_base_url in config.toml
  - netlify dev
