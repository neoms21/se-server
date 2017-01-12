'use strict';

var create = function (command, name, isFailure) {
    var event = {};

    if (command.hasOwnProperty('correlationId')) {
        event.correlationId = command.correlationId;
    }
    event.eventName = name || 'event name not specified';
    event.isFailure = isFailure || false;
    event.created = new Date();
    event.createdBy = command.userId;

    return event;
};

module.exports = {
    create: create
};