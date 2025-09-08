// const admin = require('./adminRoute')
const user = require('./userRoute');

module.exports = {
    name: 'base-route',
    version: '1.0.0',
    register: (server, options) => {
        server.route(user);
        // server.route(admin);
        // server.route(types);
    }
}   
