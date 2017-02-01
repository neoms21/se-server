'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');
const bodyParser = require('body-parser');
const cors = require('cors');

// these are routes that are not authenticated

let validateUser = (user) => {
    const deferred = q.defer();

    // attempt to match by email and password
    mongoRepository.getCount('logins', {userName: user.email, password: user.password})
        .subscribe((cnt) => {
            if (cnt === 0) {
                // no matching user & password
                deferred.reject("Email not found or password doesn't match");
            } else {
                // matched!
                deferred.resolve();
            }
        });

    return deferred.promise;
};

let openRoutes = (server, logger) => {
    const jsonParser = bodyParser.json();
    server.use(cors({origin: '*'}));

    server.post('/login', jsonParser, (req, res) => {

        // get param
        const user = req.body;

        if (!Object.keys(user).length) {
            res.status(203).send('User details not defined');
        } else {

            // validate the user
            validateUser(user)
                .then(() => {
                    // we are sending the user in the token
                    const token = jwt.sign(user, jwtSecret, {expiresIn: 360 * 5});
                    res.json({token: token});
                    logger.info('Authenticated ' + user);
                })
                .catch((err) => {
                    // error from validate
                    logger.info(err);
                    res.status(203).send('' || err);
                });
        }

    });
};

module.exports = openRoutes;
