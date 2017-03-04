'use strict';
const generalServices = require('./general-services');
const Util = require('util');

const create = (name, isFailure) => {
    let event = {};

    if (Util.isNullOrUndefined(name)) {
        throw new Error('Name needs to be specified');
    }

    event.properties = {
        eventName: name || 'event name not specified',
        isFailure: isFailure || false,
        // defaults
        messageNumber: 1,
        messageCount: 1
    };

    return event;
};

const createFromNone = function (name, isFailure) {

    let event = create(name, isFailure);

    // apply common
    generalServices.applyCommonFields(event, undefined);

    return event;
};

const createFromCommand = function (command, name, isFailure) {
    if (Util.isNullOrUndefined(command)) {
        throw new Error('Command needs to be specified');
    }

    let event = create(name, isFailure);

    event.command = {
        correlationId: command.properties.correlationId || '',
        name: command.properties.name || 'Unknown',
        clientId: command.properties.clientId
    };


    // apply common
    generalServices.applyCommonFields(event, command);

    return event;
};

const createFromQuery = function (query, name, isFailure) {
    if (Util.isNullOrUndefined(query)) {
        throw new Error('Query needs to be specified');
    }

    let event = create(name, isFailure);

    event.query = {
        correlationId: query.properties.correlationId || '',
        name: query.properties.name || 'Unknown',
        clientId: query.properties.clientId
    };

    return event;
};

let commandExecuted = function (command) {
    let ret;

    ret = exports.createFromCommand(command, 'CommandExecutedEvent', false);

    return ret;
};

let commandVerificationFailed = function (command) {
    let ret;

    ret = exports.createFromCommand(command, 'CommandVerificationFailedEvent', true);
    ret.errors = [];

    return ret;
};

let saveCommandError = function (command) {
    let ret;

    ret = exports.createFromCommand(command, 'SaveCommandErrorEvent', true);
    ret.error = '';

    return ret;
};

let commandSaved = function (command) {
    let ret;

    ret = exports.createFromCommand(command, 'CommandSavedEvent', true);

    return ret;
};

const queryFailed = (query, err) => {
  let event = exports.createFromQuery(query, 'QueryFailedEvent', 1, 1);
  event.error = err.toString();
  return event;
};

let queryVerificationFailed = function (command) {
    let ret;

    ret = exports.createFromCommand(command, 'QueryVerificationFailedEvent', true);
    ret.errors = [];

    return ret;
};

module.exports = exports = {
    CommandExecuted: commandExecuted,
    CommandVerificationFailed: commandVerificationFailed,
    SaveCommandError: saveCommandError,
    CommandSaved: commandSaved,
    createFromNone: createFromNone,
    createFromCommand: createFromCommand,
    createFromQuery: createFromQuery,
    queryFailed: queryFailed,
    QueryVerificationFailed: queryVerificationFailed,
};