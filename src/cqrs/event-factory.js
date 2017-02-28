'use strict';
const generalServices = require('./general-services');

const create = function (command, name, isFailure) {
    let event = {};

    if(name === null || name === undefined) {
        throw new Error('Name needs to be specified');
    }

    if (command !== undefined) {
        event.command = {
            correlationId: command.correlationId || '',
            name: command.name || 'Unknown'
        }
    }

    event.properties = {
        eventName: name || 'event name not specified',
        isFailure: isFailure || false,
        // defaults
        messageNumber: 1,
        messageCount: 1
    };

    // apply common
    generalServices.applyCommonFields(event, command);

    return event;
};

module.exports = {
    create: create
};