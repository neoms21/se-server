'use strict';
var commandVerifier = require('./commandVerifier');

var commandExecutedEvent = function (command) {
    var ret = {};
    var checks = commandVerifier.verify(command);

    if (checks.length > 0) {
        ret.wasSuccessful = false;
        ret.message = "Command has undefined properties " + checks.join(',');
    } else {
        ret.wasSuccessful = true;
        ret.event = {correlationId: command.correlationId};
        ret.event.eventName = 'CommandExecutedEvent';
    }

    return ret;
};

var commandVerificationFailedEvent = function (command) {
    var ret = {};
    var checks = commandVerifier.verify(command);

    if (checks.length > 0) {
        ret.wasSuccessful = false;
        ret.message = "Command has undefined properties " + checks.join(',');
        console.log("Command has undefined properties " + checks.join(','));
    } else {
        ret.wasSuccessful = true;
        ret.event = {correlationId: command.correlationId};
        ret.event.eventName = 'CommandVerificationFailedEvent';
        ret.event.messages = [];
    }

    return ret;
};

var saveCommandErrorEvent = function (command) {
    var ret = {};
    var checks = commandVerifier.verify(command);

    if (checks.length > 0) {
        ret.wasSuccessful = false;
        ret.message = "Command has undefined properties " + checks.join(',');
    } else {
        ret.wasSuccessful = true;
        ret.event = {correlationId: command.correlationId};
        ret.event.eventName = 'SaveCommandErrorEvent';
        ret.event.error = '';
    }

    return ret;
};

var commandSavedEvent = function (command) {
    var ret = {};
    var checks = commandVerifier.verify(command);

    if (checks.length > 0) {
        ret.wasSuccessful = false;
        ret.message = "Command has undefined properties " + checks.join(',');
    } else {
        ret.wasSuccessful = true;
        ret.event = {correlationId: command.correlationId};
        ret.event.eventName = 'CommandSavedEvent';
    }

    return ret;
};

module.exports = {
    CommandExecuted: commandExecutedEvent,
    CommandVerificationFailed: commandVerificationFailedEvent,
    SaveCommandError: saveCommandErrorEvent,
    CommandSaved: commandSavedEvent
};
