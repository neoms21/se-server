var commandVerifier = require('./commandVerifier');

var commandExecutedEvent = function (command) {
    var checks = commandVerifier(command);

    if (checks.length > 0) {
        throw new Error("Command has undefined properties " + checks.join(','));
    } else {
        var event = {correlationId: command.correlationId};
        event.eventName = 'CommandExecutedEvent';
        return event;
    }
};

var commandVerificationFailedEvent = function (command) {
    var checks = commandVerifier(command);

    if (checks.length > 0) {
        throw new Error("Command has undefined properties " + checks.join(','));
    } else {
        var event = {correlationId: command.correlationId};
        event.eventName = 'CommandVerificationFailedEvent';
        event.messages = [];
        return event;
    }
};

var commandSaveCommandErrorEvent = function (command) {
    var checks = commandVerifier(command);

    if (checks.length > 0) {
        throw new Error("Command has undefined properties " + checks.join(','));
    } else {
        var event = {correlationId: command.correlationId};
        event.eventName = 'SaveCommandErrorEvent';
        event.error = '';
        return event;
    }
};

var commandSavedEvent = function (command) {
    var checks = commandVerifier(command);

    if (checks.length > 0) {
        throw new Error("Command has undefined properties " + checks.join(','));
    } else {
        var event = {correlationId: command.correlationId};
        event.eventName = 'CommandSavedEvent';
        return event;
    }
};

module.exports = {
    CommandExecuted: commandExecutedEvent,
    CommandVerificationFailed: commandVerificationFailedEvent,
    SaveCommandError: commandSaveCommandErrorEvent,
    CommandSaved: commandSavedEvent
};
