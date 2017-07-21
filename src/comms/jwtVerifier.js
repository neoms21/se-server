const jwt = require('jsonwebtoken');
const jwtSecret = require('../cqrs/jwtSecret');


const verify = (token, callback) => {
    console.log('TOKEN', token);
    jwt.verify(token, jwtSecret, (err) => {
        callback(err);
    });
};


module.exports = {
    verify: verify
};
