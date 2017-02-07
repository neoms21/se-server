'use strict';
const generalServices = require('./general-services');

const create = function (command, name, isFailure) {
    let event = {};

    if (command !== undefined && command.hasOwnProperty('correlationId')) {
        event.correlationId = command.correlationId;
    }
    event.eventName = name || 'event name not specified';
    event.isFailure = isFailure || false;

    // apply common
    generalServices.applyCommonFields(event, command);
    // defaults
    event.messageNumber = 1;
    event.messageCount = 1;

    return event;
};

module.exports = {
    create: create
};