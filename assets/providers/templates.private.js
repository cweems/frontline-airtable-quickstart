const mergeFields = (templateString, customerDetails) => {
  try {
    function replacer (match) {
      // Get value of text between curly braces
      const matchText = match.match(/{{(.+?)}}/)

      // If the value is in the customerDetails, replace it
      if (customerDetails.hasOwnProperty(matchText[1])) {
        return customerDetails[matchText[1]]
      }

      // Otherwise say that the value is blank in the template.
      return `${matchText[1]} is blank`
    }

    return templateString.replace(/{{(.+?)}}/g, replacer)
  } catch (err) {
    throw new Error(err)
  }
}

const getTemplates = async (context, customerDetails) => {
  const Airtable = require('airtable')
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(context.AIRTABLE_BASE_ID)

  return new Promise((resolve, reject) => {
    const templates = {}

    base('Templates').select({
      view: 'Grid view',
      pageSize: 100
    }).eachPage(function page (records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        const category = record.get('category')
        const text = record.get('text')

        const templateBody = {
          content: mergeFields(text, customerDetails),
          whatsAppApproved: record.get('whatsAppApproved')
        }

        // Create a new object entry for template category
        // if none exists
        if (!templates.hasOwnProperty(category)) {
          const entry = {
            display_name: category,
            templates: [templateBody]
          }

          templates[category] = entry
        } else {
          templates[category].templates.push(templateBody)
        }
      })

      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage()
    }, function done (err) {
      if (err) { reject(err) }

      // Read template categories into an array
      const response = []
      for (const templateCategory in templates) {
        response.push(templates[templateCategory])
      }
      // console.log(response);
      resolve(response)
    })
  })
}

module.exports = {
  getTemplates
}
