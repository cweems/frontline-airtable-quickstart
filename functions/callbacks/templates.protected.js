const path = Runtime.getAssets()['/providers/customers.js'].path
const { getCustomerById } = require(path);

const templatesPath = Runtime.getAssets()['/providers/templates.js'].path
const { getTemplates } = require(templatesPath);

exports.handler = async function(context, event, callback) {
    try {
        console.log(event);
        const location = event.Location;
    
        // Location helps to determine which information was requested.
        // CRM callback is a general purpose tool and might be used to fetch different kind of information
        switch (location) {
            case 'GetTemplatesByCustomerId': {
                try {
                    const resp = await handleGetTemplatesByCustomerIdCallback(context, event);
                    callback(null, resp);
                } catch(err) {
                    console.log(err);
                    callback(err);
                }
                
                break;
            }
    
            default: {
                callback(422, `Unknown location: location`)
            }
        }
    } catch(err) {
        console.log(err);
        callback(err);
    }
};

const handleGetTemplatesByCustomerIdCallback = async (context, event) => {
    const customerDetails = await getCustomerById(context, event.CustomerId);
    
    if (!customerDetails) {
        throw new Error('Customer not found');
    }
    console.log(customerDetails);
    
    let templates = await getTemplates(context, customerDetails);

    // Respond with compiled Templates
    return templates;
};

const compileTemplate = (template, customer) => {
    let compiledTemplate = template.replace(/{{Name}}/, customer.display_name);
    compiledTemplate = compiledTemplate.replace(/{{Author}}/, customer.worker);
    return compiledTemplate;
};