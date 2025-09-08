const Joi = require('joi');
const { PAYMENT_STATUS, PAY_STATUS } = require('../utills/constants');
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

const dataEntryFormValidation = {
    payload: Joi.object({
        // customer form fields
        name: Joi.string().allow("", null).optional().label('name'),
        email: Joi.string().optional().allow('', null).label('email'),
        contact_no: Joi.string().required().label('contact_no'),
        // nested_customer_name: Joi.string().allow("", null).optional().label('nested_customer_name'),
        // nested_customer_number: Joi.string().optional().allow(null, '').label('nested_customer_number'),
        item: Joi.string().optional().allow(null, '').label('item'),
        unique_id: Joi.string().optional().allow('', null).label('unique_id'),
        // type_id: Joi.number().optional().allow(null, '').label('type_id'),
        vechile_number: Joi.string().optional().allow(null, '').label('vechile_number'),
        pay_status: Joi.string().valid(...[PAY_STATUS.WEEKLY, PAY_STATUS.MONTHLY]).optional().allow('', null).label('pay_status'),

        // dataEntry form fields
        vechile_no: Joi.string().required().label('vechile_no'),
        type: Joi.string().required().label('type'),
        first_wheight: Joi.string().required().label('first_wheight'),
        m_first_wheight: Joi.string().optional().allow('', null).label('m_first_wheight'),
        second_weight: Joi.string().optional().allow('', null).label('second_weight'),
        m_second_weight: Joi.string().optional().allow('', null).label('m_second_weight'),
        net_weight: Joi.string().optional().allow('', null).label('net_weight'),
        payment_status: Joi.string().valid(...[PAYMENT_STATUS.DUE, PAYMENT_STATUS.PAID, PAYMENT_STATUS.WEEKLY, PAYMENT_STATUS.MONTHLY]).optional().allow("").label('payment_status'),
        payment_mode: Joi.string().optional().allow('', null).label('payment_mode'),
        paid_amount: Joi.string().optional().allow('', null).label('paid_amount'),
        due_amount: Joi.string().optional().allow('', null).label('due_amount'),
        customer_name: Joi.string().allow("", null).optional().label('customer_name'),
        customer_phone_number: Joi.string().optional().allow(null, '').label('customer_phone_number'),
        second_weight_date: Joi.string().optional().allow(null, '').label('second_weight_date'),
        second_weight_time: Joi.string().optional().allow(null, '').label('second_weight_time'),
    }),
};

const getAllDataEntryListValidation = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .description("Page number for pagination"),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(15)
            .default(5)
            .description("Number of items per page"),
        search_field: Joi.string()
            .valid(
                "vechile_no",
                "payment_status",
                "serial_no",
                "operator_name",
                "customer_name",
            )
            .optional()
            .label("search_field"),
        search_input: Joi.string().optional().label("search_input"),
    }),
};

const editDataEntryFormValidation = {
    params: Joi.object({
        id: Joi.number().required().label('id'),
    }),
    payload: Joi.object({
        // customer form fields
        name: Joi.string().allow("", null).optional().label('name'),
        email: Joi.string().optional().allow('', null).label('email'),
        contact_no: Joi.string().optional().allow(null, '').label('contact_no'),

        item: Joi.string().optional().allow(null, '').label('item'),
        vechile_number: Joi.string().optional().allow(null, '').label('vechile_number'),
        pay_status: Joi.string().valid(...[PAY_STATUS.WEEKLY, PAY_STATUS.MONTHLY]).optional().allow('', null).label('pay_status'),


        // dataEntry form fields
        vechile_no: Joi.string().optional().allow(null, '').label('vechile_no'),
        type: Joi.number().optional().allow('', null).label('type'),
        first_wheight: Joi.string().optional().allow('', null).label('first_wheight'),
        m_first_wheight: Joi.string().optional().label('m_first_wheight'),
        second_weight: Joi.string().optional().allow('', null).label('second_weight'),
        m_second_weight: Joi.string().optional().allow('', null).label('m_second_weight'),
        net_weight: Joi.string().optional().allow('', null).label('net_weight'),
        payment_status: Joi.string().valid(...[PAYMENT_STATUS.DUE, PAYMENT_STATUS.PAID, PAYMENT_STATUS.WEEKLY, PAYMENT_STATUS.MONTHLY]).optional().allow(null, "").label('payment_status'),
        payment_mode: Joi.string().optional().allow('', null).label('payment_mode'),
        paid_amount: Joi.string().optional().allow('', null).label('paid_amount'),
        due_amount: Joi.string().optional().allow('', null).label('due_amount'),
        customer_name: Joi.string().allow("", null).optional().label('customer_name'),
        customer_phone_number: Joi.string().optional().allow(null, '').label('customer_phone_number'),
        second_weight_date: Joi.string().optional().allow(null, '').label('second_weight_date'),
        second_weight_time: Joi.string().optional().allow(null, '').label('second_weight_time'),
    }),
};

// report generator
const reportValidation = {
    query: Joi.object({
        filter: Joi.string().valid('today', 'week', 'month').required().messages({
            'any.only': "Filter must be one of 'today', 'week', or 'month'.",
            'any.required': 'Filter is required.',
        }),
    }),
};

const parkingCreateValidations = {
    payload: Joi.object({
        vechile_no: Joi.string().required().label('vechile_no'),
        contact_no: Joi.string().optional().allow('', null).label('contact_no'),

    }),
}

const getAllParkingListValidation = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .description("Page number for pagination"),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(15)
            .default(5)
            .description("Number of items per page"),
    }),
};

const updateParkTimeValidation = {
    payload: Joi.object({
        parking_id: Joi.number().required().label('parking_id'),

    }),
}

const createCheckFormValidation = {
    payload: Joi.object({
        vechile_no: Joi.string().required().label('vechile_no'),
        contact_no: Joi.string().optional().allow('', null).label('contact_no'),
        type_id: Joi.number().required().label('type_id'),
        status: Joi.string().required().valid(...[PAYMENT_STATUS.PAID, PAYMENT_STATUS.DUE]).label('status'),
        note: Joi.string().optional().allow(null, '').label('note'),
    }),
}

const updateCheckStatusValidation = {
    payload: Joi.object({
        check_id: Joi.number().required().label('check_id'),
        status: Joi.string().required().valid(...[PAYMENT_STATUS.PAID, PAYMENT_STATUS.DUE]).label('status'),
    }),
}

const getAllCheckDetailsValidation = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .description("Page number for pagination"),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(15)
            .default(5)
            .description("Number of items per page"),
    }),
}
const createLedgerValidation = {

    payload: Joi.object({
        amount: Joi.string().optional().allow(null, '').label('amount'),
        parking: Joi.string().optional().allow(null, '').label('parking'),
        check: Joi.string().optional().allow(null, '').label('check'),
        due_paid: Joi.string().optional().allow(null, '').label('due_paid'),
        expenses: Joi.string().optional().allow(null, '').label('expenses'),
        wages: Joi.string().optional().allow(null, '').label('wages'),
        commission: Joi.string().optional().allow(null, '').label('commission'),
        loan: Joi.string().optional().allow(null, '').label('loan'),
        remarks: Joi.string().optional().allow(null, '').label('remarks'),
        total_balance: Joi.string().optional().allow(null, '').label('total_balance'),
    }),
}
const fetchLedgerValidation = {
    query: Joi.object({
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .description("Page number for pagination"),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(15)
            .default(5)
            .description("Number of items per page"),
    }),
}
module.exports = {
    dataEntryFormValidation,
    getAllDataEntryListValidation,
    editDataEntryFormValidation,
    reportValidation,
    parkingCreateValidations,
    getAllParkingListValidation,
    updateParkTimeValidation,
    createCheckFormValidation,
    updateCheckStatusValidation,
    getAllCheckDetailsValidation,
    createLedgerValidation,
    fetchLedgerValidation
}