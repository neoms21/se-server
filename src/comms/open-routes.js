'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');
const bodyParser = require('body-parser');
const cors = require('cors');
const login = require('./login');

// these are routes that are not authenticated

let openRoutes = (server, logger) => {
    login.init(logger);
    const jsonParser = bodyParser.json();
    server.use(cors({origin: '*'}));

    server.post('/login', jsonParser, login.postLogin);
};

module.exports = openRoutes;
