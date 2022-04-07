exports.handler = async function (context, event, callback) {
  console.log('Handling outgoing conversation.')

  const location = event.Location

  // Location helps to determine which action to perform.
  switch (location) {
    case 'GetProxyAddress': {
      handleGetProxyAddress(context, event, callback)
      break
    }

    default: {
      console.log('Unknown location: ', location)
      callback(new Error(`422 Unknown location: ${location}`))
    }
  }
}

const handleGetProxyAddress = (context, event, callback) => {
  console.log('Getting proxy address.')
  const channelName = event.ChannelType

  const proxyAddress = getCustomerProxyAddress(context, channelName)

  // In order to start a new conversation ConversationsApp need a proxy address
  // otherwise the app doesn't know from which number send a message to a customer
  if (proxyAddress) {
    const resp = { proxy_address: proxyAddress }
    console.log(`Selected a proxy address ${proxyAddress}`)
    return callback(null, resp)
  }

  callback(new Error('403 Proxy address not found, check TWILIO_SMS_NUMBER environment variable.'))
}

const getCustomerProxyAddress = (context, channelName) => {
  if (channelName === 'whatsapp') {
    return context.TWILIO_WHATSAPP_NUMBER
  } else {
    return context.TWILIO_SMS_NUMBER
  }
}
