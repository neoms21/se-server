'use strict';
var eventFactory = require('./event-factory');

var commandExecuted = function (command) {
    var ret;

    ret = eventFactory.create(command, 'CommandExecutedEvent', false);

    return ret;
};

var commandVerificationFailed = function (command) {
    var ret;

    ret = eventFactory.create(command, 'CommandVerificationFailedEvent', true);
    ret.messages = [];

    return ret;
};

var saveCommandError = function (command) {
    var ret;

    ret = eventFactory.create(command, 'SaveCommandErrorEvent', true);
    ret.error = '';

    return ret;
};

var commandSaved = function (command) {
    var ret;

    ret = eventFactory.create(command, 'CommandSavedEvent', true);

    return ret;
};

module.exports = {
    CommandExecuted: commandExecuted,
    CommandVerificationFailed: commandVerificationFailed,
    SaveCommandError: saveCommandError,
    CommandSaved: commandSaved
};
