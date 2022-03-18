const path = Runtime.getAssets()['/providers/customers.js'].path
const { getCustomerById } = require(path);

const templatesPath = Runtime.getAssets()['/providers/templates.js'].path;
const { getTemplatesList } = require(templatesPath);
const lodash = require("lodash");

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
    console.log('Getting templates: ', event.CustomerId);

    const pageSize = event.PageSize;
    const anchor = event.Anchor || 0;
    const customerDetails = await getCustomerById(context, event.CustomerId);

    if (!customerDetails) {
        throw new Error('Customer not found');
    }

     // Fetch Templates list
     const templatesList = await getTemplatesList(context, pageSize, anchor);
     console.log('Templates found: ', templatesList.length);

    // Prepare templates categories
    const compiledTemplates = prepareTemplates(templatesList, customerDetails)
    console.log('Templates compiled: ', compiledTemplates.length);

    // Respond with compiled Templates
    return compiledTemplates;
};

const prepareTemplates = (templates, customerDetails) => {
    let compiledTemplates = [];
    templates.forEach(template => {
        const compiledTemplate = {
            display_name: template.categoryName,
            content: compileTemplate(template.content, customerDetails),
            whatsAppApproved:  template.whatsAppApproved   
        };

        compiledTemplates.push(compiledTemplate);
    });

    const templatesGroupedByCategory = lodash
        .chain(compiledTemplates)
        .groupBy('display_name')
        .map((value, key) => ({ display_name: key, templates: value }))
        .value();
    
    return templatesGroupedByCategory;
};

const compileTemplate = (template, customer) => {
    let compiledTemplate = template.replace(/{{Name}}/, customer.display_name);
    compiledTemplate = compiledTemplate.replace(/{{Author}}/, customer.worker);
    return compiledTemplate;
};