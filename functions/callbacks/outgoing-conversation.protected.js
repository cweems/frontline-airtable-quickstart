exports.handler = async function(context, event, callback) {
    console.log('outgoingConversationCallbackHandler');

    const location = event.Location;

    // Location helps to determine which action to perform.
    switch (location) {
        case 'GetProxyAddress': {
            handleGetProxyAddress(context, event, callback);
            break;
        }

        default: {
            console.log('Unknown location: ', location);
            callback(422, location);
        }
    }
};

const handleGetProxyAddress = (context, event, callback) => {
    console.log('Getting Proxy Address');
    const channelName = event.ChannelType;

    const proxyAddress = getCustomerProxyAddress(context, channelName);

    // In order to start a new conversation ConversationsApp need a proxy address
    // otherwise the app doesn't know from which number send a message to a customer
    if (proxyAddress) {
        const resp = { proxy_address: proxyAddress };
        console.log(`Got proxy address! ${proxyAddress}`);
        return callback(null, resp);
    }

    callback(403, "Proxy address not found");
};

const getCustomerProxyAddress = (context, channelName) => {
    if (channelName === 'whatsapp') {
        return context.TWILIO_WHATSAPP_NUMBER;
    } else {
        return context.TWILIO_SMS_NUMBER;
    }
};