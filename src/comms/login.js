'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');

let logger;

const init = (loggerInstance) => {
    logger  =  loggerInstance;
};

let validateUser = (user) => {
    const deferred = q.defer();

    // attempt to match by email and password
    mongoRepository.getCount('logins', {userName: user.userName, password: user.password})
        .subscribe((cnt) => {
            if (cnt === 0) {
                // no matching user & password
                deferred.reject("Email not found or password doesn't match");
            } else {
                // matched!
                deferred.resolve();
            }
        }, (err) => {
            deferred.reject("Database " + err);
        });

    return deferred.promise;
};

let postLogin = (req, res, logger) => {
    // get param
    const user = req.body;

    if (!Object.keys(user).length) {
        res.status(203).send('User details not defined');
        return;
    }

    if (user.userName === undefined || user.password === undefined) {
        res.status(203).send('User details not defined correctly');
        return;
    }

    // validate the user
    validateUser(user)
        .then(() => {
            // we are sending the user in the token
            const token = jwt.sign(user, jwtSecret, {expiresIn: 360 * 5});
            res.json({token: token});
            logger.info('Authenticated via login' + user.userName);
        })
        .catch((err) => {
            // error from validate
            logger.error(err);
            res.status(500).send('' || err);
        });

};

module.exports = {
    postLogin: postLogin,
    init: init
};