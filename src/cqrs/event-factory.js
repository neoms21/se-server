'use strict';
const generalServices = require('./general-services');

const create = function (command, name, isFailure) {
    let event = {};

    if (command.hasOwnProperty('correlationId')) {
        event.correlationId = command.correlationId;
    }
    event.eventName = name || 'event name not specified';
    event.isFailure = isFailure || false;
    event.created = generalServices.getTime();
    event.createdBy = command.userId;
    // defaults
    event.messageNumber = 1;
    event.messageCount = 1;

    return event;
};

module.exports = {
    create: create
};