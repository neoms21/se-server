'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');

// these are routes that are not authenticated

let openRoutes = (server, logger) => {

    server.post('login', (req, res, next) => {

        // get param
        const user = req.body;

        // validate the user
        validateUser(user)
            .then((isAuthenticated) => {
                if (isAuthenticated) {
                    // we are sending the user in the token
                    const token = jwt.sign(user, jwtSecret, {expiresInMinutes: 60 * 5});
                    res.json({token: token});
                } else {
                    res.json({error: 'Not authenticated'});
                }
            })
            .catch((err) => {
                // error from validate
                logger.error(err);
                res.send(500, err);
            });

        next();
    });
};

let validateUser = (user) => {
    const deferred = q.defer();

    // attempt to match by email and password
    mongoRepository.getCount('logins', {email: user.email, password: user.password})
        .subscribe((cnt) => {
            if (cnt === 0) {
                // no matching user & password
                deferred.reject(new Error("Email not found or password doesn't match"));
            } else {
                // matched!
                deferred.accept();
            }
        });

    return deferred;
};

module.exports = openRoutes;
