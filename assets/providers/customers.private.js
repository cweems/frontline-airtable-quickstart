// Create global variable to memoize customer data
// so that we do not ping airtable for all customers every page load

let lastFetch = ''
let customers = []

const getAirtableCustomerByParams = async (context, params) => {
  const Airtable = require('airtable')
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(context.AIRTABLE_BASE_ID)

  return new Promise((resolve, reject) => {
    let customer

    base('Customers').select(params).eachPage(function page (records, fetchNextPage) {
      customer = formatCustomerRecord(records[0])
      fetchNextPage()
    }, function done (err) {
      if (err) {
        reject(JSON.stringify(err))
      }

      resolve(customer)
    })
  })
}

// Retrieve customers from Airtable
const getAllAirtableCustomers = async (context, workerId) => {
  const Airtable = require('airtable')
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(context.AIRTABLE_BASE_ID)

  const querySettings = {
    view: 'Grid view',
    pageSize: 100
  }

  // Filter airtable results by owner if we know
  // the worker ID
  if (workerId) {
    querySettings.filterByFormula = `{owner} = '${workerId}'`
  }

  return new Promise((resolve, reject) => {
    const formattedCustomers = []

    base('Customers').select(querySettings).eachPage(function page (records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        const formattedRecord = formatCustomerRecord(record)
        formattedCustomers.push(formattedRecord)
      })

      fetchNextPage()
    }, function done (err) {
      if (err) { reject(err) }
      resolve(formattedCustomers)
    })
  })
}

const getNewCustomers = (context, worker) => {
  const Airtable = require('airtable')
  const base = new Airtable({ apiKey: context.AIRTABLE_API_KEY }).base(context.AIRTABLE_BASE_ID)

  const querySettings = {
    view: 'Grid view',
    pageSize: 100,
    filterByFormula: `IS_AFTER(CREATED_TIME(), DATETIME_PARSE('${lastFetch}'))`
  }

  return new Promise((resolve, reject) => {
    const newCustomers = []

    base('Customers').select(querySettings).eachPage(function page (records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.

      records.forEach(function (record) {
        const formattedRecord = formatCustomerRecord(record)
        newCustomers.push(formattedRecord)
      })

      fetchNextPage()
    }, function done (err) {
      if (err) { reject(err) }
      resolve(newCustomers)
    })
  })
}

const formatCustomerRecord = (customerRecord) => {
  try {
    const unformattedAddress = customerRecord.get('sms')
    const formattedAddress = unformattedAddress.replace(/[-()]/gm, '')

    return {
      customer_id: `${customerRecord.get('id')}`,
      display_name: `${customerRecord.get('name')}`,
      channels: [
        { type: 'sms', value: `${customerRecord.get('sms')}` },
        { type: 'whatsapp', value: `${customerRecord.get('whatsapp')}` }
      ],
      links: [
        { type: 'LinkedIn', value: `${customerRecord.get('linkedin')}`, display_name: 'Social Media Profile' },
        { type: 'Email', value: `mailto:${customerRecord.get('email')}`, display_name: 'Email Address' }
      ],
      details: {
        title: 'Information',
        content: `${customerRecord.get('notes')}`
      },
      worker: `${customerRecord.get('owner')}`,
      address: `${formattedAddress}`
    }
  } catch (err) {
    return new Error(err)
  }
}

const findWorkerForCustomer = async (context, customerNumber) => {
  if (customers.length === 0) {
    customers = await getAllAirtableCustomers(context)
  }

  const workerForCustomer = customers.filter(customer => {
    if (customerNumber.includes(customer.address)) {
      return customer
    }

    return null
  })

  if (workerForCustomer.length > 0) {
    return workerForCustomer[0].worker
  }

  return null
}

const findRandomWorker = async (context) => {
  if (customers.length === 0) {
    customers = await getAllAirtableCustomers(context)
  }

  const uniqueWorkers = []

  for (const customer of customers) {
    if (!uniqueWorkers.includes(customer.worker)) {
      uniqueWorkers.push(customer.worker)
    }
  }

  const randomIndex = Math.floor(Math.random() * uniqueWorkers.length)
  return uniqueWorkers[randomIndex]
}

const getCustomersList = async (context, worker, pageSize, anchor) => {
  // Pull airtable customers on first load,
  // otherwise use what's stored in memory
  if (anchor === undefined || customers.length === 0) {
    console.log('hard pull')
    customers = await getAllAirtableCustomers(context, worker)
    const date = new Date()
    lastFetch = date.toISOString()
  } else {
    console.log('prepping to pull new customers, lastFetch was at, ', lastFetch)
    const newCustomers = await getNewCustomers(context, worker)
    customers = customers.concat(newCustomers)
    const date = new Date()
    lastFetch = date.toISOString()
    console.log('existing customers, only getting new ones. here are the new ones: \n', newCustomers)
    console.log('last fetch is now: ', lastFetch)
  }

  const workerCustomers = customers.filter(customer => customer.worker === worker)
  const list = workerCustomers.map(customer => ({
    display_name: customer.display_name,
    customer_id: customer.customer_id,
    avatar: customer.avatar
  }))

  if (!pageSize) {
    return list
  }

  if (anchor) {
    const lastIndex = list.findIndex((c) => String(c.customer_id) === String(anchor))
    const nextIndex = lastIndex + 1
    return list.slice(nextIndex, nextIndex + pageSize)
  } else {
    return list.slice(0, pageSize)
  }
}

const getCustomerByNumber = async (context, customerNumber) => {
  const customer = await getAirtableCustomerByParams(context, {
    view: 'Grid view',
    filterByFormula: `{sms} = '${customerNumber}'`,
    maxRecords: 1
  })
  return customer
}

const getCustomerById = async (context, customerId) => {
  const customer = await getAirtableCustomerByParams(context, {
    view: 'Grid view',
    filterByFormula: `{id} = '${customerId}'`,
    maxRecords: 1
  })
  return customer
}

module.exports = {
  findWorkerForCustomer,
  findRandomWorker,
  getCustomerById,
  getCustomersList,
  getCustomerByNumber
}
