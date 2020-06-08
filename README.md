# rain-or-shine

rain-or-shine is a weather app for Strava

## To do
- Improve weather description templating
- Save settings to user in db
- Allow user to define settings such as weather provider, description template
- Settings management page


## Getting started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project onto Netlify.

### Prerequisites

1. Strava account
1. FaunaDB account
1. git
1. yarn
1. node

### Setup & Run Locally
1. Clone the repository

```
# git clone https://github.com/JonHenningsson/rain-or-shine.git
```

2. Enter the repo and install the dependencies

```
# cd rain-or-shine && yarn install
```

3. Setup FaunaDB integration
   1. Create a new database
   1. Create a new collection "User"
   1. Create a new index "user_unique_athleteId", terms = "data.athleteId", Unique = checked
   1. Create a new SERVER KEY

4. Setup Strava integration
   1. Create a new API application and note down Client ID and Client Secret

5. Set the environment variables for FaunaDB and Strava API:
```
# export FAUNADB_API_SERVER_SECRET=your_fauna_server_secret STRAVA_API_CLIENT_ID=your_strava_client_id STRAVA_API_CLIENT_SECRET=your_strava_client_secret NWS_API_UA_EMAIL=your_contact_email
```

6. Set your contact email NWS API:
```
export NWS_API_UA_EMAIL=your_contact_email
```

7. Set weather provider API environment variables:
```
# export NWS_API_UA_EMAIL=your_contact_email
```

8. Generate a private/public key pair and encode them in base64. Set the environment variables:
```
# export JWT_PRIVATE_KEY_BASE64=<your_private_key_base64_encoded> JWT_PUBLIC_KEY_BASE64=<your_public_key_base64_encoded>
```

9. If you intend to run the webhook verification test, set the required environment variable:
```
# export STRAVA_VERIFY_TOKEN=12345
```

10. Run project locally:

```
# yarn run netlify dev
```

The authentication page is available at the netlify dev URL, e.g. http://localhost:8888.


## Running the tests

Tests with mocha and chai are available in ./test. The tests are designed to simulate the Strava webhooks, user signup and settings management by triggering the Netlify functions.

### ./test/add-user.js

For the add-user tests you must have a Strava profile to sign in with.

1. Set the required environment variables:
```
# export NETLIFY_URL="http://localhost:8888"
# export STRAVA_API_CLIENT_ID=46844
```

2. Obtain a Strava login url:
```
# yarn geturl
yarn run v1.22.4
$ node test/scripts/gen-strava-url
Strava authorization URL: https://www.strava.com/oauth/authorize?client_id=46844&redirect_uri=http://localhost:8888/connect/test&response_type=code&scope=read,activity:write,activity:read&state=not_used
```

3. Visit the URL, complete the login, copy the authorization code from the URL and set the authorization code environment variable:
```
# export TEST_CODE=e7ea14f3b991686cf9fdf345ed96ceb8e684834c
```

4. You can now run the add-user tests:
```
# yarn run mocha test/add-user.js --timeout 5000
yarn run v1.22.4
$ ~/rain-or-shine/node_modules/.bin/mocha test/add-user.js --timeout 5000


  adduser
    GET /.netlify/functions/add-user
JWT Cookie: jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdGhsZXRlSWQiOjE0NjU1NDQ3LCJpYXQiOjE1OTE2MzI4MTMsImV4cCI6MTU5NjgxNjgxM30.iY1uIdb3xvNCDs9aCZXz6mwpNxnWH1Wbw-deCck-8LbQRfa4h8AUI20tZx705gcm1Itty-mV8JtBBfUwVXbFB_9RchzSKS8v3rj5Zp60OOyvVBNpnZMcVVdJjgnntRmtAPUkZt88nDbJ69w9GC5BEAsBMGaWVNmGlEAEPBSqCyxpoFVL5t_dRv_s3b6Hd9iajLpJHSuKHOUqr7rZienKz9LnnWSVuYHbqvjpu1cZDTVrt9pPN1bI5rHUWPzPJP4nRGuby5-7deq36htnK9foIkqBXG9KPYBQMYag8n4xAOPudi4ATtz5zXePbVixktXO2S-5weooEBlBW8KkCRL__AmsJmyIzG9Ftn3bR-TKuJ_ilsgtjt6l-8p0IcjiE9GuFjd-56lbReNOJntrDwYcFLnS63saqTa3PjJhhBP8b64EspNTm6mv0M_Fm7kLn7eMPmur2YXmnDwvm5ONOnDiDuBMIPBU_tsS6OxifY39m0GqLdRvGkdsH0-GpDl6l4B-HWFtaDNhT8C04CMSlwjRYQGLtPr-fcazRtH5E5-I3yTJ4yx2ef9bruhpYAINSLplyTdkj1b5n1-ScGgcow9aszOAy0hUoWzd_ffzHheZIXSgpCrtDImm0G9CfL3wZX77j1E5fvtjFARxqMlySLnXYD5ucZWTV1MhoceGx_J8jfk; Path=/; HttpOnly
      ✓ Add user - valid (711ms)
      ✓ Add user - invalid code (192ms)


  2 passing (907ms)

Done in 1.18s.
```

5. If you plan to run the settings tests later, copy the JWT cookie value.

### ./test/webhook.js

For the webhook tests you must have a user and activity that the application is allowed to access.

1. Identify the athlete and activity id from the Strava URLs of the Athlete and Activity pages.

2. Set the environment variables:
```
# export OWNER_ID=<your_athlete_id>
# export ACTIVITY_ID=<your_activity_id>
```

3. In order to pass the subscription verification test, set the required environment variable:
```
export STRAVA_VERIFY_TOKEN=12345
```
Note that this also required the same to be set in the netlify environment.

4. You can now run the webhook tests:
```
# yarn run mocha test/webhook.js --timeout 10000
yarn run v1.22.4
$ ~/rain-or-shine/node_modules/.bin/mocha test/webhook.js --timeout 10000


  webhook
    GET /.netlify/functions/webhook
      ✓ Verification request - valid
      ✓ Verification request - invalid verify token
    POST /.netlify/functions/webhook
      ✓ create - activity (2310ms)
      ✓ create - activity - invalid owner id (168ms)
      ✓ create - activity - invalid activity id (499ms)
      ✓ bogus event


  6 passing (3s)

Done in 3.26s.
```

### ./test/settings.js

For the settings tests you must have a user in the database with valid settings.


1. In order to pass the JWT authentication, set the required environment variable to the value of "JWT Cookie" that was printed from add-user.
```
# export JWT_COOKIE="jwt=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdGhsZXRlSWQiOjE0NjU1NDQ3LCJpYXQiOjE1OTE2MzI4MTMsImV4cCI6MTU5NjgxNjgxM30.iY1uIdb3xvNCDs9aCZXz6mwpNxnWH1Wbw-deCck-8LbQRfa4h8AUI20tZx705gcm1Itty-mV8JtBBfUwVXbFB_9RchzSKS8v3rj5Zp60OOyvVBNpnZMcVVdJjgnntRmtAPUkZt88nDbJ69w9GC5BEAsBMGaWVNmGlEAEPBSqCyxpoFVL5t_dRv_s3b6Hd9iajLpJHSuKHOUqr7rZienKz9LnnWSVuYHbqvjpu1cZDTVrt9pPN1bI5rHUWPzPJP4nRGuby5-7deq36htnK9foIkqBXG9KPYBQMYag8n4xAOPudi4ATtz5zXePbVixktXO2S-5weooEBlBW8KkCRL__AmsJmyIzG9Ftn3bR-TKuJ_ilsgtjt6l-8p0IcjiE9GuFjd-56lbReNOJntrDwYcFLnS63saqTa3PjJhhBP8b64EspNTm6mv0M_Fm7kLn7eMPmur2YXmnDwvm5ONOnDiDuBMIPBU_tsS6OxifY39m0GqLdRvGkdsH0-GpDl6l4B-HWFtaDNhT8C04CMSlwjRYQGLtPr-fcazRtH5E5-I3yTJ4yx2ef9bruhpYAINSLplyTdkj1b5n1-ScGgcow9aszOAy0hUoWzd_ffzHheZIXSgpCrtDImm0G9CfL3wZX77j1E5fvtjFARxqMlySLnXYD5ucZWTV1MhoceGx_J8jfk; Path=/; HttpOnly"
```

2. You can now run the settings tests:
```
# yarn run mocha test/settings.js --timeout 5000
yarn run v1.22.4
$ ~/rain-or-shine/node_modules/.bin/mocha test/settings.js --timeout 5000


  manage-settings
    GET /.netlify/functions/manage-settings
      ✓ Get settings request - valid (143ms)
      ✓ Get settings request - invalid JWT
      ✓ Settings logout request - valid
    POST /.netlify/functions/manage-settings
      ✓ Save settings request - valid (301ms)
      ✓ Save settings request - invalid (88ms)


  5 passing (545ms)

Done in 0.81s.

```

## Deployment

At this point it is assumed that you have created the Fauna DB database and Strava API application.

1. In the Strava API application settings, configure your public production domain as Strava Authorization Domain, e.g. myapp.example.com.

2. Make sure that your Netlify site has the required environment variables:
```
FAUNADB_API_SERVER_SECRET
    <your_faunadb_api_server_secret>

NWS_API_UA_EMAIL
    <your_contact_email>

STRAVA_API_CLIENT_ID
    <your_strava_api_client_id>

STRAVA_API_CLIENT_SECRET
    <your_strava_api_client_secret>

JWT_PRIVATE_KEY_BASE64
    <your_private_key_base64_encoded>

JWT_PRIVATE_KEY_BASE64
    <your_public_key_base64_encoded>

STRAVA_VERIFY_TOKEN
    12345
```

3. Deploy the code to Netlify through git or manual upload.

Upon build completion, it is currently necessary to create a subscription manually in order to receive webhooks. You can do this with the provided yarn scripts.

4. Before managing the subscriptions, set the strava client id and secret as environment variables:
```
# export STRAVA_API_CLIENT_ID=your_strava_client_id STRAVA_API_CLIENT_SECRET=your_strava_client_secret
```

5. Create the subscription:
```
# yarn subscribe https://myapp.example.com
yarn run v1.22.4
$ node scripts/strava-subscribe-create https://myapp.example.com
== Success ==
Successfully created subscription!
{ id: 157547 }
Done in 1.52s.

```

6. If you need to delete a subscription, first list to get the subscription id, and then delete the subscription:

```
# yarn subscriptions
yarn run v1.22.4
$ node scripts/strava-subscribe-list
== Success ==
Successfully retrieved subscriptions!
[
  {
    id: 157547,
    resource_state: 2,
    application_id: 46844,
    callback_url: 'https://myapp.example.com',
    created_at: '2020-05-23T22:43:59Z',
    updated_at: '2020-05-23T22:43:59Z'
  }
]
Done in 0.80s.

# yarn unsubscribe 157547
yarn run v1.22.4
$ node scripts/strava-subscribe-delete 157547
== Success ==
Successfully deleted subscription!
Done in 0.58s.

```
