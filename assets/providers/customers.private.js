// Map between customer address and worker identity
// Used to determine to which worker route a new conversation with a particular customer
//
// {
//     customerAddress: workerIdentity
// }
//
// Example:
//     {
//         'whatsapp:+12345678': 'john@example.com'
//     }

// Create global variable to memoize customer data
// so that we do not ping airtable for all customers every page load
let customers = [];

// Retrieve customers from Airtable
// Example:
const retrieveAirtableData = async (context) => {
    const Airtable = require('airtable');
    const base = new Airtable({apiKey: context.AIRTABLE_API_KEY}).base(context.AIRTABLE_BASE_ID);

    return new Promise((resolve, reject) => {
        let formattedCustomers = [];
    
        base('Customers').select({
            view: "Grid view",
            pageSize: 100
        }).eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.
        
            records.forEach(function(record) {
                let unformattedAddress = record.get('sms');
                let formattedAddress = unformattedAddress.replace(/[-()]/gm, "");
                let formattedRecord = {
                    customer_id: record.get('id'),
                    display_name: record.get('name'),
                    channels: [
                        { type: 'sms', value: record.get('sms') },
                        { type: 'whatsapp', value: record.get('whatsapp') }
                    ],
                    links: [
                        { type: 'LinkedIn', value: record.get('linkedin'), display_name: 'Social Media Profile' },
                        { type: 'Email', value: `mailto:${record.get('email')}`, display_name: 'Email Address' }
                    ],
                    details:{
                        title: "Information",
                        content: record.get('notes')
                    },
                    worker: record.get('owner'),
                    address: formattedAddress
                }
                formattedCustomers.push(formattedRecord);
            });
        
            // To fetch the next page of records, call `fetchNextPage`.
            // If there are more records, `page` will get called again.
            // If there are no more records, `done` will get called.
            console.log('fetching next page...')
            fetchNextPage();
        
        }, function done(err) {
            if (err) { reject(err) }
            resolve(formattedCustomers);
        });
    });

}

const findWorkerForCustomer = async (context, customerNumber) => {
    if(customers.length === 0) {
        customers = await retrieveAirtableData(context);
    }

    const workerForCustomer = customers.filter(customer => {
        if (customerNumber.includes(customer.address)) {
            return customer;
        }
    });

    if (workerForCustomer.length > 0) {
        return workerForCustomer[0].worker;
    }

    return null;
}

const findRandomWorker = async (context) => {
    if(customers.length === 0) {
        customers = await retrieveAirtableData(context);
    }
    
    const uniqueWorkers = [];

    for (const customer of customers) {
        console.log(customer.worker);
        if (!uniqueWorkers.includes(customer.worker)) {
            uniqueWorkers.push(customer.worker);
        }
    }

    const randomIndex = Math.floor(Math.random() * uniqueWorkers.length)
    return uniqueWorkers[randomIndex]
}

const getCustomersList = async (context, worker, pageSize, anchor) => {
    console.log(pageSize, anchor);

    // Pull airtable customers on first load, otherwise use
    // what's stored in memory
    if(anchor === undefined || customers.length === 0) {
        customers = await retrieveAirtableData(context);
    }
    const workerCustomers = customers.filter(customer => customer.worker === worker);
    const list = workerCustomers.map(customer => ({
        display_name: customer.display_name,
        customer_id: customer.customer_id,
        avatar: customer.avatar,
    }));

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
};

const getCustomerByNumber = async (context, customerNumber) => {
    if (customers.length === 0) {
        customers = await retrieveAirtableData(context);
    }
    return customers.find(customer => customer.channels.find(channel => String(channel.value) === String(customerNumber)));
};

const getCustomerById = async (context, customerId) => {
    if (customers.length === 0) {
        customers = await retrieveAirtableData(context);
    }
    return customers.find(customer => String(customer.customer_id) === String(customerId));
};

module.exports = {
    findWorkerForCustomer,
    findRandomWorker,
    getCustomerById,
    getCustomersList,
    getCustomerByNumber
};
