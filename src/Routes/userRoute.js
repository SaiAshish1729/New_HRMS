const { Authentication } = require("../config/auth");
const controller = require("../controller/users");
const { createUserValidation, loginUserValidation, userListValidation } = require("../validations/user");

module.exports = [
    {
        method: 'POST',
        path: '/user/add-user',
        options: {
            tags: ['api', 'User'],
            handler: controller.addUsers,
            description: 'Add User',
            validate: {
                ...createUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({ statusCode: 400, error: "Bad Request", message: customErrorMessages, }).code(400).takeover();
                },
            },
        },
    },

    {
        method: 'POST',
        path: '/user/login',
        options: {
            tags: ['api', 'User'],
            handler: controller.userLogin,
            description: 'User Login',
            validate: {
                ...loginUserValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({ statusCode: 400, error: "Bad Request", message: customErrorMessages, }).code(400).takeover();
                },
            },
        },
    },

    {
        method: 'GET',
        path: '/user/profile',
        options: {
            tags: ['api', 'User'],
            handler: controller.userProfile,
            description: 'User Profile',
            pre: [Authentication],
        },
    },

    {
        method: 'GET',
        path: '/user/all-uesrs',
        options: {
            tags: ['api', 'User'],
            handler: controller.allUserList,
            description: 'User List',
            // pre: [Authentication],
            validate: {
                ...userListValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({ statusCode: 400, error: "Bad Request", message: customErrorMessages, }).code(400).takeover();
                },
            },
        },
    },

    {
        method: 'GET',
        path: '/user/check-out',
        options: {
            tags: ['api', 'User'],
            handler: controller.userCheckout,
            description: 'User Checkout',
            pre: [Authentication],
        },
    },

]