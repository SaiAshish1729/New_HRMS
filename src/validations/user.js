const Joi = require('joi');

const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

// add-user
const createUserValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
        department_id: Joi.number().required().label('department_id'),
        designation: Joi.string().required().label('designation'),
        role_id: Joi.number().required().label('role_id'),
    }),
};

// login with email
const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

const userListValidation = {
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
        // search_field: Joi.string()
        //     .valid(
        //         "vechile_no",
        //         "payment_status",
        //         "serial_no",
        //         "operator_name",
        //         "customer_name",
        //     )
        //     .optional()
        //     .label("search_field"),
        // search_input: Joi.string().optional().label("search_input"),
    }),
};
module.exports = {
    createUserValidation,
    loginUserValidation,
    userListValidation,
}