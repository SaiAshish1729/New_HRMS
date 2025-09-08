const controller = require("../controller/type");


module.exports = [
    {
        method: 'GET',
        path: '/type/get-all-types',
        options: {
            tags: ['api', 'Types'],
            handler: controller.fetchAlltypes,
            description: 'Fetch All Types',
        },
    },
]