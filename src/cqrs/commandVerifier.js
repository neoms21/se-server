var util = require('util');

var commandVerifier = function (command) {
    var errors = [];

    if (util.isUndefined(command)) {
        errors.push('command was not defined');
    } else {

        if (util.isUndefined(command.commandName)) {
            errors.push('command needs its className');
        }

        if (util.isUndefined(command.correlationId) || command.correlationId === '') {
            errors.push('command needs its correlationId');
        }

    }

    return errors;
};

module.exports = commandVerifier;
