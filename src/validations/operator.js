const Joi = require("joi");
const { GENDER, STATUS } = require("../utills/constants");
const contactNoPattern = /^(\+|\d)[0-9]{7,16}$/;

const createOperatorValidation = {
    payload: Joi.object({
        name: Joi.string().required().label('name'),
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
        gender: Joi.string().required().valid(...[GENDER.MALE, GENDER.FEMALE, GENDER.OTHER]).label('gender'),
        contact_no: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('contact_no'),
        location: Joi.string().required().label('location'),
        date_of_birth: Joi.date().required().label('Date of Birth'),
        profile_image: Joi.any()
            .meta({ swaggerType: 'file' })
            .description('File to upload')
            .optional().label('profile_image')
    }),
};

const editOperatorByAdminValidation = {
    payload: Joi.object({
        operator_id: Joi.number().required().label('operator_id'),
        name: Joi.string().required().label('name'),
        gender: Joi.string().required().valid(...[GENDER.MALE, GENDER.FEMALE, GENDER.OTHER]).label('gender'),
        contact_no: Joi.string().regex(contactNoPattern).message('Please provide a valid contact number').required().label('contact_no'),
        location: Joi.string().required().label('location'),
        date_of_birth: Joi.date().required().label('Date of Birth'),
        status: Joi.string().optional().valid(...[STATUS.ACTIVE, STATUS.INACTIVE]).label('Status'),
    }),
};

const getAllOaperatorsValidation = {
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
                "name",
                "contact_no",
                "email",
            )
            .optional()
            .label("search_field"),
        search_input: Joi.string().optional().label("search_input"),
    }),
};

const fetchSingleOperatorValidation = {
    params: Joi.object({
        operator_id: Joi.number().required().label('operator_id'),
    })
};

// delete operator
const deleteOperatorValidation = {
    payload: Joi.object({
        operator_id: Joi.number().required().label('operator_id'),
    }),
};

const operatorLoginValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

const OperatorStatusUpdateByAdminValidation = {
    payload: Joi.object({
        operator_id: Joi.number().required().label('operator_id'),
        status: Joi.string().optional().valid(...[STATUS.ACTIVE, STATUS.INACTIVE]).label('Status'),
    }),
};
module.exports = {
    createOperatorValidation,
    getAllOaperatorsValidation,
    deleteOperatorValidation,
    operatorLoginValidation,
    fetchSingleOperatorValidation,
    editOperatorByAdminValidation,
    OperatorStatusUpdateByAdminValidation,
}