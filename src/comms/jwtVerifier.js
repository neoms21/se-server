const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');


const verify = (token, callback) => {
    jwt.verify(token, jwtSecret, (err) => {
        callback(err);
    });
};


module.exports = {
    verify: verify
};
