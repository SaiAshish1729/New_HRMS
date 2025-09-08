const Joi = require("joi");

const adminLoginValidation = {
    payload: Joi.object({
        email: Joi.string().required().label('email'),
        password: Joi.string().required().label('password'),
    })
};

const adminChangePasswordValidation = {
    payload: Joi.object({
        oldPassword: Joi.string().required().label('oldPassword'),
        newPassword: Joi.string().required().label('newPassword'),
    })
};

module.exports = {
    adminLoginValidation,
    adminChangePasswordValidation,
}
