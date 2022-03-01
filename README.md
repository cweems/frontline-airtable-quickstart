# Twilio Serverless Frontline Integration Service

This repository implements a minimal Twilio Frontline integration service using Twilio Serverless with Airtable as the CRM.

## Prerequisites

We recommend following the setup outlined Frontline node.js quickstart, which shows you how to do the following:

* A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
* An SMS enabled [phone number](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#sign-up-for-a-twilio-account-and-get-a-phone-number).
* A [Twilio Frontline instance](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#create-a-new-twilio-frontline-instance).
* Twilio Conversations [configured](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#configure-twilio-conversations) to use the Frontline Conversations service as it's default conversation service.
* Additionally, you'll need to copy this Airtable Base template and have your Airtable API keys ready.

Once you reach the step to "Configure the Frontline Integration Service" you are ready to deploy this app.

## Setup
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

### Environment Variables Reference
Here are the environment variables that must be configured for the app to run:

```bash
ACCOUNT_SID= # Your twilio account SID, found in the console.
AUTH_TOKEN= # Your auth token, found in the console.

SSO_REALM_SID= # Go to console > Frontline > Manage > SSO/Log in

TWILIO_SMS_NUMBER= # SMS enabled phone number in e164 format (e.g. +14135551234)
TWILIO_WHATSAPP_NUMBER= # A Twilio WhatsApp sender, if you have one.

AIRTABLE_API_KEY= # Your Airtable API key
AIRTABLE_BASE_ID= # Your Airtable Base ID
AIRTABLE_TABLE_NAME= # Table name to pull contacts from
```

## Deploy
Deploy this Serverless app with one command:
```bash
twilio serverless:deploy
```
The app provides five callback URLs:

* /callbacks/crm
* /callbacks/outgoing-conversation
* /callbacks/routing
* /callbacks/templates
* /callbacks/twilio-conversations

## Configure Callbacks

Copy and paste the callback URLs (uncluding your unique subdomain) into your Frontline configuration in the console.

Routing configuration:

<img width="1278" alt="Screen Shot 2022-02-28 at 11 43 02 PM" src="https://user-images.githubusercontent.com/1418949/156145008-bdffde5e-3c71-465e-b660-a9312f6167cc.png">


Other callbacks:

<img width="1535" alt="Screen Shot 2022-02-28 at 11 42 24 PM" src="https://user-images.githubusercontent.com/1418949/156145175-a458a1d8-62be-433f-870c-31151f5996a6.png">
