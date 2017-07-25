'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');
const jwtSecret = require('../cqrs/jwtSecret');
const mongoRepository = require('./../db/mongo-repository');
const pick = require('../utilities/pick');

let logger;

const init = (loggerInstance) => {
    logger = loggerInstance;
};

let validateUser = (user) => {
    const deferred = q.defer();

    // attempt to match by email and password
    mongoRepository.query('logins', {"userName": user.userName, "password": user.password})
        .subscribe((foundUser) => {

            if (foundUser) {
                // matched
                deferred.resolve(foundUser);
            } else {
                // not found!!
                logger.error({err: `Email or password is not valid. ${user}`});
                deferred.resolve(false);
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
        .then((userFromDb) => {

            if (userFromDb) {
                // success, so send back token
                const token = jwt.sign(userFromDb, jwtSecret, {expiresIn: 360 * 5});

                let resultUser = pick(userFromDb, 'name', 'userName', '_id');
                resultUser.token = token;
                res.status(200).json(resultUser);
                logger.info('Authenticated via login ' + userFromDb.userName);
            } else {
                // was a non fatal error

                res.status(202).send(`Email or password is not valid.`);
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