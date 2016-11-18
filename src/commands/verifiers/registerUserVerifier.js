var registerUserVerifier = function (command) {

    var errors = [];

    if (command.name === undefined || command.name === null) {
        errors.push('registerUser command name property was not defined');
    }

    if (command.userName === undefined || command.userName === null) {
        errors.push('registerUser command userName property was not defined');
    }

    if (command.password === undefined || command.password === null) {
        errors.push('registerUser command password property was not defined');
    } else {
        if (command.password.length < 6) {
            errors.push('password must be at least 6 characters long');
        }
    }

    return errors;
};

module.exports = registerUserVerifier;