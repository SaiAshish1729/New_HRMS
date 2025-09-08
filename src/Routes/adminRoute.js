const controller = require("../controller/admin")
const Joi = require('joi');
const { adminLoginValidation, adminChangePasswordValidation } = require("../validations/admin");

module.exports = [
    {
        method: 'POST',
        path: '/admin/login',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.adminLogin,
            description: 'Admin Login',
            validate: {
                ...adminLoginValidation,
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

    // profile
    {
        method: 'GET',
        path: '/admin/me/profile',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.adminProfile,
            description: 'Admin Profile',
        },
    },

    // change password 
    {
        method: 'POST',
        path: '/admin/change-password',
        options: {
            tags: ['api', 'Admin'],
            handler: controller.changePassword,
            description: 'Admin Change Password',
            validate: {
                ...adminChangePasswordValidation,
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
]