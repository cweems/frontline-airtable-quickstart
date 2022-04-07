#!/usr/bin/env node

const prompts = require('prompts')
const fetch = require('node-fetch')
const opn = require('opn')
let promptResponse

function validateRealmSid (ac) {
  const regex = /^JB\S{32}$/
  return regex.test(ac) ? true : 'Invalid SSO Realm SID.'
}

function validateUrl (url) {
  const regex = /https:\/\/\S{1,}\.okta\.com$/
  return regex.test(url) ? true : 'Invalid URL, must include https://{your-subdomain}.okta.com with no trailing slash.'
}

function wrapUp (jsonResponse) {
  console.log('Sucessfully created Okta app! More information here:')
  console.log('\n')
  console.log(jsonResponse)
  console.log('\n')
  console.log("Opening your Okta app's configuration page.")
  console.log('Enter these credentials at:\nhttps://console.twilio.com/us1/develop/frontline/manage/single-sign-on?frameUrl=%2Fconsole%2Ffrontline%2Fsso%3Fx-target-region%3Dus1')

  setTimeout(() => {
    opn('https://console.twilio.com/us1/develop/frontline/manage/single-sign-on?frameUrl=%2Fconsole%2Ffrontline%2Fsso%3Fx-target-region%3Dus1')
  }, 3000)

  setTimeout(() => {
    opn(`${promptResponse.oktaUrl}/app/${jsonResponse.name}/${jsonResponse.id}/setup/help/SAML_2_0/instructions`)
  }, 4000)
}

const promptQuestions = [
  {
    type: 'text',
    name: 'realmSid',
    message: 'Enter your Twilio Frontline SSO Realm SID \n (https://console.twilio.com/us1/develop/frontline/manage/single-sign-on?frameUrl=%2Fconsole%2Ffrontline%2Fsso%3Fx-target-region%3Dus1) \n:',
    validate: (value) => validateRealmSid(value)
  },
  {
    type: 'text',
    name: 'oktaUrl',
    message: 'Enter your Okta Organization URL (e.g. https://dev-12345-admin.okta.com):',
    validate: (value) => validateUrl(value)
  },
  {
    type: 'text',
    name: 'oktaToken',
    hidden: true,
    replace: '*',
    message: 'Enter your Okta API token:'
  },
  {
    type: 'text',
    name: 'oktaAppLabel',
    message: 'What name would you like to give your Frontline instance in Okta?'
  }
]

async function run () {
  promptResponse = await prompts(promptQuestions)

  const jsonBody = {
    label: promptResponse.oktaAppLabel,
    visibility: {
      autoSubmitToolbar: false,
      hide: {
        iOS: false,
        web: false
      }
    },
    features: [],
    signOnMode: 'SAML_2_0',
    settings: {
      signOn: {
        defaultRelayState: '',
        ssoAcsUrl: `https://iam.twilio.com/v2/saml2/authenticate/${promptResponse.realmSid}`,
        // eslint-disable-next-line no-useless-escape, no-template-curly-in-string
        idpIssuer: 'http://www.okta.com/\${org.externalKey}',
        audience: `https://iam.twilio.com/v2/saml2/metadata/${promptResponse.realmSid}`,
        recipient: `https://iam.twilio.com/v2/saml2/authenticate/${promptResponse.realmSid}`,
        destination: `https://iam.twilio.com/v2/saml2/authenticate/${promptResponse.realmSid}`,
        // eslint-disable-next-line no-template-curly-in-string
        subjectNameIdTemplate: '${user.userName}',
        subjectNameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
        responseSigned: true,
        assertionSigned: true,
        signatureAlgorithm: 'RSA_SHA256',
        digestAlgorithm: 'SHA256',
        honorForceAuthn: true,
        authnContextClassRef: 'urn:oasis:names:tc:SAML:2.0:ac:classes:PasswordProtectedTransport',
        spIssuer: null,
        requestCompressed: false,
        attributeStatements: [
          {
            type: 'EXPRESSION',
            name: 'Full Name',
            namespace: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
            values: [
              "String.join(' ', user.firstName, user.lastName)"
            ]
          },
          {
            type: 'EXPRESSION',
            name: 'roles',
            namespace: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
            values: [
              'user.userType'
            ]
          },
          {
            type: 'EXPRESSION',
            name: 'email',
            namespace: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic',
            values: [
              'user.email'
            ]
          },
          {
            type: 'EXPRESSION',
            name: 'image_url',
            namespace: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
            values: [
              'user.profileUrl'
            ]
          }
        ]
      }
    }
  }

  fetch(`${promptResponse.oktaUrl}/api/v1/apps`, {
    method: 'post',
    body: JSON.stringify(jsonBody),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `SSWS ${promptResponse.oktaToken}`
    }
  })
    .then(res => res.json())
    .then(json => wrapUp(json))
};

run()
