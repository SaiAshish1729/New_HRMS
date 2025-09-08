const controller = require("../controller/operator")
const Joi = require('joi');
const { createOperatorValidation, getAllOaperatorsValidation, deleteOperatorValidation, operatorLoginValidation, fetchSingleOperatorValidation, editOperatorByAdminValidation, OperatorStatusUpdateByAdminValidation } = require("../validations/operator");
const { Authentication, operatorAuth } = require("../config/auth");

module.exports = [
    // create operator
    {
        method: 'POST',
        path: '/operator/add-operator',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.createOperator,
            description: "Operator Registration",
            pre: [Authentication],
            validate: {
                ...createOperatorValidation,
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
            payload: {
                output: 'stream',
                parse: true,
                allow: 'multipart/form-data',
                multipart: true,
                maxBytes: 10485760, // 10MB limit
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responseMessages: []
                }
            }
        }

    },

    // fetch all operators
    {
        method: 'GET',
        path: '/operator/all-operators',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.fetchAllOperators,
            description: "Fetch All Operators",
            pre: [Authentication],
            validate: {
                ...getAllOaperatorsValidation,
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
        }
    },

    // delete an operator
    {
        method: 'DELETE',
        path: '/operator/delete-operator',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.deleteOperator,
            description: "Delete  Operator",
            pre: [Authentication],
            validate: {
                ...deleteOperatorValidation,
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
        }
    },

    // operators login
    {
        method: 'POST',
        path: '/operator/login',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.operatorLogin,
            description: 'Operator Login',
            validate: {
                ...operatorLoginValidation,
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
        path: '/operator/me/profile',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.operatorProfile,
            description: 'Operator Profile',
            pre: [operatorAuth],
        },
    },

    // fetch single operator 
    {
        method: 'GET',
        path: '/operator/single-operator/{operator_id}',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.fetchSingleOperatorById,
            description: 'Fetch Single Operator By Id',
            pre: [Authentication],
            validate: {
                ...fetchSingleOperatorValidation,
                failAction: (request, h, err) => {
                    const customErrorMessages = err.details.map(
                        (detail) => detail.message
                    );
                    return h.response({
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

    // edit operator 
    {
        method: 'PUT',
        path: '/operator/edit-operator-by-admin',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.editOperator,
            description: "Edit Operator By Admin",
            pre: [Authentication],
            validate: {
                ...editOperatorByAdminValidation,
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
        }
    },

    // update operator status by admin
    {
        method: 'PUT',
        path: '/operator/update-operator-status',
        options: {
            tags: ['api', 'Operator'],
            handler: controller.suspendOperator,
            description: "Update Operator's Status",
            pre: [Authentication],
            validate: {
                ...OperatorStatusUpdateByAdminValidation,
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
        }
    },
]