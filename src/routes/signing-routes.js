'use strict';
const jwt = require('jsonwebtoken');
const q = require('q');

let signInOutRoutes = (server, logger) => {

    server.post('login', (req, res, next) => {

        // get param
        const user = req.body;

        // validate the user
        validateUser(user)
            .then((isAuthenticated) => {

                if (isAuthenticated) {
                    // we are sending the profile in the token
                    const token = jwt.sign(profile, jwtSecret, {expiresInMinutes: 60 * 5});

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


    return deferred;
};

module.exports = signInOutRoutes;
