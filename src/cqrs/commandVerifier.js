var util = require('util');

var commandVerifier = function (command) {
    var errors = [];

    if (util.isNullOrUndefined(command)) {
        errors.push('command was not defined');
    } else {

        if (util.isNullOrUndefined(command.properties.commandName)) {
            errors.push('command needs its commandName');
        }

        if (util.isNullOrUndefined(command.properties.correlationId) || command.properties.correlationId === '') {
            errors.push('command needs its correlationId');
        }

    }

    return errors;
};

module.exports.verify = commandVerifier;
