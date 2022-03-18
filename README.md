# Twilio Serverless Frontline Integration Service

![Twilio Frontline Integrations Service](https://user-images.githubusercontent.com/1418949/156482434-bda73f12-b1c1-4876-9177-0367751f6ff5.png)


This repository implements a Twilio Frontline integration service using Twilio Serverless with Airtable as the contact databse.

## Prerequisites

We recommend following the setup outlined Frontline node.js quickstart, which shows you how to do the following:

* A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
* An SMS enabled [phone number](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#sign-up-for-a-twilio-account-and-get-a-phone-number).
* A [Twilio Frontline instance](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#create-a-new-twilio-frontline-instance).
* Twilio Conversations [configured](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#configure-twilio-conversations) to use the Frontline Conversations service as it's default conversation service.
* Additionally, you'll need to [copy this Airtable Base template](https://airtable.com/shrJUwh8WzSkzIqJr) and have your [Airtable API key](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-) along with your [Base ID](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Once you reach the step to "Configure the Frontline Integration Service" you are ready to deploy this app.

## Project Setup
Follow these steps to clone the repository, install dependencies, and set environment variables:

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
AIRTABLE_CUSTOMERS_TABLE_NAME= # Your Aitable Customers table name
AIRTABLE_TEMPLATES_TABLE_NAME= # Your Aitable Templates table name
```

## Deploy
Deploy this Serverless app with one command:
```bash
twilio serverless:deploy
```
If your deploy is successful, you should see an output that looks like this:
<img width="1056" alt="Screen Shot 2022-03-02 at 4 32 36 PM" src="https://user-images.githubusercontent.com/1418949/156485462-1a1c5143-3259-4a80-b0b1-0ce8520951aa.png">


The app provides five callback URLs:
* `/callbacks/crm`: called when Frontline loads the contact list or a user detail page.
* `/callbacks/outgoing-conversation`: called when a user initiates an outbound conversation.
* `/callbacks/routing`: called when a messages is sent inbound that does not match an open conversation.
* `/callbacks/templates`: called when a user opens the templates menu.
* `/callbacks/twilio-conversations`: called after a conversation is created or a participant is added to the conversation.

## Configure Callbacks

Copy and paste the callback URLs (uncluding your unique subdomain) into your Frontline configuration in the console.

### Routing configuration

In the Twilio Console, go to ***Frontline > Manage > Routing*** and add `[your_app_url]/callbacks/routing` under Custom routing:
<img width="1278" alt="Screen Shot 2022-02-28 at 11 43 02 PM" src="https://user-images.githubusercontent.com/1418949/156145008-bdffde5e-3c71-465e-b660-a9312f6167cc.png">


### General callbacks
In the Twilio Console, go to ***Frontline > Manage > Callbacks*** and copy / paste the following callback URLs from your Frontline integration service:
* CRM Callback URL: `[your_app_url]/callbacks/crm`
* Outgoing Conversations Callback URL: `[your_app_url]/callbacks/outgoing-conversation`
* Templates Callback URL: `[your_app_url]/callbacks/templates`

<img width="1535" alt="Screen Shot 2022-02-28 at 11 42 24 PM" src="https://user-images.githubusercontent.com/1418949/156145175-a458a1d8-62be-433f-870c-31151f5996a6.png">

### Conversations Setup Callbacks
This callback receives the `onConversationAdded` and `onParticipantAdded` events from the Conversations service and sets the name of the conversation as well as the participant and participant avatar that is joining the conversation.

To set them up, go to ***Conversations > Services > Default Frontline Service > Webhooks***. Then select the `onConversationAdded` and `onParticipantAdded` events.