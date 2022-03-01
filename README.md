# Twilio Serverless Frontline Integration Service

This repository implements a minimal Twilio Frontline integration service using Twilio Serverless with Airtable as the CRM.

## Prerequisites

We recommend following the Frontline node.js quickstart, which shows you how to do the following:

* A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
* An SMS enabled [phone number](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#sign-up-for-a-twilio-account-and-get-a-phone-number).
* A [Twilio Frontline instance](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#create-a-new-twilio-frontline-instance).
* Twilio Conversations [configured](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#configure-twilio-conversations) to use the Frontline Conversations service as it's default conversation service.
* Additionally, you'll need to copy this Airtable Base template and have your Airtable API keys ready.

Once you reach the step to "Configure the Frontline Integration Service" you are ready to deploy this app.

## Deploy
Once deployed, this integration service will provide the required callback URLs that your Frontline Service needs to integrate with your CRM. Follow these steps:

```bash
# Clone the repository:
git clone

# Change to the project directory:
cd frontline-quick-deploy

# Install dependencies:
npm install

# Copy the sample environment variables file to .env:
cp .env.example .env
```

### Environment Variables
```bash
ACCOUNT_SID= # Your twilio account SID, found in the console.
AUTH_TOKEN= # Your auth token, found in the console.

SSO_REALM_SID= # Go to console > Frontline > Manage > SSO/Log in

TWILIO_SMS_NUMBER= # SMS enabled phone number in e164 format (e.g. +14135551234)
TWILIO_WHATSAPP_NUMBER=

AIRTABLE_API_KEY=
AIRTABLE_BASE_ID=
AIRTABLE_TABLE_NAME=
```