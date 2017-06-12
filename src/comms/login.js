'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');

let logger;

const init = (loggerInstance) => {
    logger = loggerInstance;
};

let validateUser = (user) => {
    const deferred = q.defer();

    // attempt to match by email and password
    mongoRepository.getCount('logins', {userName: user.userName, password: user.password})
        .subscribe((cnt) => {
            if (cnt === 0) {
                // no matching user & password
                deferred.resolve(`Email or password is not valid.`);
            } else {
                // matched!
                deferred.resolve();
            }
        }, (err) => {
            deferred.reject("Database " + err);
        });

    return deferred.promise;
};

let postLogin = (req, res) => {
    // get param
    const user = req.body;

    if (!Object.keys(user).length) {
        res.status(203).send('User details not defined');
        logger.error('Login with no details');
        return;
    }

    if (user.userName === undefined || user.password === undefined) {
        res.status(203).send('User details not defined correctly');
        logger.error('Login with details incorrect ' + JSON.stringify(user));
        return;
    }

    // validate the user
    validateUser(user)
        .then((feedback) => {
            if (feedback === undefined) {
                // success, so send back token
                const token = jwt.sign(user, jwtSecret, {expiresIn: 360 * 5});
                res.status(200).json({token: token});
                logger.info('Authenticated via login ' + user.userName);
            } else {
                // was a non fatal error
                logger.error({err: feedback});
                res.status(202).send(feedback);
            }
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