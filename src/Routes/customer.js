const controller = require("../controller/customer");
const { searchCustomerValidation } = require("../validations/customer");

module.exports = [
    {
        method: 'GET',
        path: '/customer/search-customer',
        options: {
            tags: ['api', 'Customer'],
            handler: controller.searshCustomer,
            description: 'Searches For Customers',
            validate: {
                ...searchCustomerValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h
                        .response({
                            statusCode: 400,
                            error: "Bad Request",
                            message: customErrorMessages,
                        })
                        .code(400)
                        .takeover();
                },
            },
        },
    },

    // all customers
    {
        method: 'GET',
        path: '/customer/all-customer',
        options: {
            tags: ['api', 'Customer'],
            handler: controller.allCustomers,
            description: 'Fetch all Customers',
        },
    },
]