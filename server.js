'use strict';

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const Pack = require('./package');
const baseRouter = require('./src/Routes')


const server = Hapi.server({
    port: process.env.PORT || 5500,
    host: process.env.HOST || 'localhost',
    routes: {
        cors: {
            origin: ["*"],
            headers: ["Authorization", "Content-Type", "If-None-Match"], // Define allowed headers
            exposedHeaders: ["WWW-Authenticate", "Server-Authorization"],
            additionalExposedHeaders: ["X-Custom-Header"],
            maxAge: 60,
            credentials: true, // Allow credentials (cookies, authorization headers, etc.)
        },
    },
});

const init = async () => {
    const swaggerOptions = {
        info: {
            title: 'Internal Employee Management API Documentation',
            version: Pack.version,
        },
        schemes: ['http', 'https'],
        grouping: 'tags',
        // consumes: ['multipart/form-data'],
        consumes: ['application/json'], // Specify application/json as the content type for request payloads
        produces: ['application/json'],
        securityDefinitions: {
            jwt: {
                type: 'apiKey',
                name: 'Authorization',
                in: 'header',
                description: 'JWT authorization header using the Bearer scheme'
            }
        }
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return '<h3>Hello!</h3>'
        }
    });

    // Adding plugins for swagger docs;
    await server.register([
        Inert,
        Vision,
        // jwtAuth,
        {
            plugin: HapiSwagger,
            options: {
                ...swaggerOptions,
                security: [{ jwt: [] }]
            }
        }
    ])
    server.route({
        method: 'GET',
        path: '/uploads/{param*}',
        handler: {
            directory: {
                path: './src/uploads',
                redirectToSlash: true,
                index: false,
            }
        }
    });

    await server.register(baseRouter, {
        routes: {
            prefix: '/api'
        }
    });


    await server.start();
    console.log('Server running on %s', server.info.uri);
    console.log('Check swagger on %s', `${server.info.uri}/documentation`);
};

init();