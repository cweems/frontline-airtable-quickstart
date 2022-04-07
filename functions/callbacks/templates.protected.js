// eslint-disable-next-line no-undef
const customersPath = Runtime.getAssets()['/providers/customers.js'].path
const { getCustomerById } = require(customersPath)

// eslint-disable-next-line no-undef
const templatesPath = Runtime.getAssets()['/providers/templates.js'].path
const { getTemplates } = require(templatesPath)

exports.handler = async function (context, event, callback) {
  try {
    const location = event.Location

    // Location helps to determine which information was requested.
    // CRM callback is a general purpose tool and might be used to fetch different kind of information
    switch (location) {
      case 'GetTemplatesByCustomerId': {
        console.log('Getting templates by customer ID.')

        try {
          const resp = await handleGetTemplatesByCustomerIdCallback(context, event)
          callback(null, resp)
        } catch (err) {
          console.log(`Failed to get templates by customer ID: ${err}`)
          callback(err)
        }

        break
      }

      default: {
        callback(new Error(`422 Unknown location: ${location}`))
      }
    }
  } catch (err) {
    console.log(err)
    callback(err)
  }
}

const handleGetTemplatesByCustomerIdCallback = async (context, event) => {
  const customerDetails = await getCustomerById(context, event.CustomerId)

  if (!customerDetails) {
    throw new Error('Customer not found')
  }

  const templates = await getTemplates(context, customerDetails)

  // Respond with compiled Templates
  return templates
}
