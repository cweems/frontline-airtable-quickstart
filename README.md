# Twilio Serverless Frontline Integration Service

![Twilio Frontline Integrations Service](https://user-images.githubusercontent.com/1418949/156482434-bda73f12-b1c1-4876-9177-0367751f6ff5.png)


This repository implements a Twilio Frontline integration service using Twilio Serverless with Airtable as the contact databse.

> :warning: **Not an official Twilio Project**: this software is not owned or maintained by Twilio. There is no Twilio support SLA for this integration.

> :warning: **Scaling limits**: Airtable's API has a maximum throughput of 5 requests per second. This product is not suitable for large teams, see the Integration Limits section for more details. 

## ▶️ [Video Setup Tutorial](https://www.youtube.com/watch?v=KDrhR1HyrlE)

## Prerequisites

We recommend following the setup outlined in the [Frontline node.js quickstart](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart), or watching the [setup video](https://www.youtube.com/watch?v=KDrhR1HyrlE), which walk you through the following:

* A Twilio Account. Don't have one? [Sign up](https://www.twilio.com/try-twilio) for free!
* An SMS enabled [phone number](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#sign-up-for-a-twilio-account-and-get-a-phone-number).
* A [Twilio Frontline instance](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#create-a-new-twilio-frontline-instance). 
**Note: I got an error here "Could not create environment," then upgraded my account to an employee account, refreshed, and it worked. Is it possible that frontline will not work on trial accounts? If so, we should make a note here.**
* Twilio Conversations [configured](https://www.twilio.com/docs/frontline/nodejs-demo-quickstart#configure-twilio-conversations) to use the Frontline Conversations service as it's default conversation service.
* Additionally, you'll need to [copy this Airtable Base template](https://airtable.com/shrbXF88oQlRh7ZXh) and have your [Airtable API key](https://support.airtable.com/hc/en-us/articles/219046777-How-do-I-get-my-API-key-) along with your [Base ID](https://support.airtable.com/hc/en-us/articles/4405741487383-Understanding-Airtable-IDs).

Once you reach the step to "Configure the Frontline Integration Service" you are ready to deploy this app using the following directions - no need to follow any further steps in the quickstart documentation.

## Project Setup
Follow these steps to clone the repository, install dependencies, and set environment variables:

```bash
# Clone the repository:
git clone

# Change to the project directory:
cd frontline-airtable-quickstart **note - this is different in the video**

# Install dependencies:
npm install

**note - in the video, the Okta setup steps occur before this**
**note - in the vidoe, when we get back from setting up Okta in Frontline, it tells us to Assign the Application, but does not make it clear how/where we navigate to do so**

# Copy the sample environment variables file to .env:
cp .env.example .env
```

### Environment Variables Reference
Here are the environment variables that must be configured for the app to run:
**note - the 'code' command is super slick - is that an iTerm thing?**

```bash
ACCOUNT_SID= # Your twilio account SID, found in the console.
AUTH_TOKEN= # Your auth token, found in the console.

SSO_REALM_SID= # Go to console > Frontline > Manage > SSO/Log in

TWILIO_SMS_NUMBER= # SMS enabled phone number in e164 format (e.g. +14135551234)
TWILIO_WHATSAPP_NUMBER= # A Twilio WhatsApp sender, if you have one.

AIRTABLE_API_KEY= # Your Airtable API key
AIRTABLE_BASE_ID= # Your Airtable Base ID
```

## Deploy
Deploy this Serverless app with one command:
```bash
twilio serverless:deploy
```
> :information_source: **Always deploy to the same Twilio Account as your Frontline Service**: This integration service uses Twilio-signed requests to protect the callback URLs. The callback URLs will reject requests from a different Twilio account with a 403 error. You can check which account you're deploying to with `twilio profiles:list` and add another account with `twilio profiles:add`. 

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

## Data Format
A sample Airtable template can be found [here](https://airtable.com/shrbXF88oQlRh7ZXh).

Note that addresses in the `sms` and `whatsapp` columns must be in e164 format, e.g. +1234567890. If numbers are formatted differently, the integration may fail to find customers in Airtable when a conversation is initiated from an inbound message.

## Integration Limits
We don't recommend using this integration to support more than 30 Frontline users and/or more than 4000 contacts. Here are the details to know:

Airtable's API has a maximum throughput of 5 requests per second. This integration service generates a request to Airtable under the following conditions:
* When a user opens the contact list the first time, or refreshes the contact list. Multiple API calls may be generated if more than 100 contacts are returned.
* When a user opens a customer profile page.
* When a user opens the templates menu from the mesage compose input.
* When a new customer texts inbound and creates a new conversation.

Additionally, Twilio Functions has the following limits:
* Functions may not run for longer than 10 seconds.
* You can't have more than 30 function invocations running concurrently.

If you are returning a large contact list to users, your Twilio function may time out before Airtable returns all the pages of the query results.
