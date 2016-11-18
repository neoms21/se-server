var commandVerifier = function (command) {
    var errors = [];

    if (command === undefined || command === null) {
        errors.push('command was not defined');
    }

    if (command.code === undefined || command.code === null) {
        errors.push('command needs a code');
    }

    return errors;
};

module.exports = commandVerifier;
