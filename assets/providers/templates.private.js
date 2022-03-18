// Map between template address and worker identity
// Used to determine to which worker route a new conversation with a particular template
//
// {
//     templateAddress: workerIdentity
// }
//
// Example:
//     {
//         'whatsapp:+12345678': 'john@example.com'
//     }

// Create global variable to memoize template data
// so that we do not ping airtable for all templates every page load
let templates = [];

// Retrieve templates from Airtable
// Example:
const retrieveAirtableData = async (context) => {
    const Airtable = require('airtable');
    const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(context.AIRTABLE_BASE_ID);

    return new Promise((resolve, reject) => {
        let formattedTemplates = [];

        base('Templates').select({
            view: "Grid view",
            pageSize: 100
        }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            records.forEach(function (record) {
                let formattedRecord = {
                    template_id: record.get('id'),
                    categoryName: record.get('categoryName')[0],
                    content: record.get('content'),
                    whatsAppApproved: record.get('whatsAppApproved')
                }

                formattedTemplates.push(formattedRecord);
            });

            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            console.log('fetching next page...')
            fetchNextPage();

        }, function done(err) {
            if (err) { reject(err) }

            const approvedTemplates = formattedTemplates.filter(template => {
                if (template.whatsAppApproved) {
                    return template;
                }
            });
            resolve(approvedTemplates);
        });
    });

}

const getTemplatesList = async (context, pageSize, anchor) => {
    console.log(pageSize, anchor);

    // Pull airtable templates on first load, otherwise use
    // what's stored in memory
    if (anchor === undefined || templates.length === 0) {
        templates = await retrieveAirtableData(context);
    }

    if (!pageSize) {
        return templates
    }

    if (anchor) {
        const lastIndex = templates.findIndex((c) => String(c.template_id) === String(anchor))
        const nextIndex = lastIndex + 1
        return templates.slice(nextIndex, nextIndex + pageSize)
    } else {
        return templates.slice(0, pageSize)
    }
};

module.exports = {
    getTemplatesList
};
