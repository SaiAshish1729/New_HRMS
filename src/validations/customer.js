const Joi = require("joi");

const searchCustomerValidation = {
    query: Joi.object({
        search_field: Joi.string()
            .valid(
                "name",
            )
            .optional()
            .label("search_field"),
        search_input: Joi.string().optional().label("search_input"),
    }),
};

module.exports = {
    searchCustomerValidation,

}