'use strict';
const bodyParser = require('body-parser');
const cors = require('cors');
const login = require('./login');

// these are routes that are not authenticated

let openRoutes = (server, logger) => {
    login.init(logger);
    const jsonParser = bodyParser.json();
    server.use(cors({origin: '*'}));

    server.post('/login', jsonParser, login.postLogin);
    server.post('/verify', jsonParser, login.verifyToken);
};

module.exports = openRoutes;
