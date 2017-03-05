'use strict';
const path = require('path');
const Rx = require('rxjs');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const eventMediator = require('./event-mediator');
const eventFactory = require('./event-factory');
const commandVerifier = require('./commandVerifier');
const generalServices = require('./general-services');
const Util = require('util');

let mappings = [];
let logger;

function init(log) {
    logger = log;
    mappings = []; //

    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/commands')
        .match('*-tests*') // ignore tests with the not()
        .not()
        .find((err, filenames) => {
            if (err) {
                logger.error("error finding handlers ", err);
            } else {
                filenames.forEach(function (filename) {

                    // instantiate so we can get command
                    let instance = require(filename);

                    if (instance !== undefined) {
                        let mapping = {command: instance.getCommand(), handler: instance};
                        // add to our list
                        mappings.push(mapping);
                        log.info('Added command ' + mapping.command);
                    }
                });
            }
        });
}

function saveCommand(command) {

    generalServices.applyCommonFields(command, command);

    // save to db
    mongoRepository.insert('commands', command)
        .subscribe(function () {
                let event = eventFactory.CommandSaved(command);
                eventMediator.dispatch(event);
            }, function (err) {
                let event = eventFactory.SaveCommandError(command);
                event.error = err.toString();
                eventMediator.dispatch(event);
            }
        );

    // log it
    logger.info('Saving command ' + command.commandName);
}

function createCommand(request, clientId) {
    let instance;

    // needs command name
    if (!Util.isNullOrUndefined(request.properties)) {

        // create it now
        instance = {
            properties: {
                commandName: request.properties.commandName,
                correlationId: request.properties.correlationId,
                clientId: clientId
            }
        };

        // add extra props
        Object.assign(instance, request.payload);
    }

    return instance;
}

let createError = function (command, responses) {
    let event = eventFactory.CommandVerificationFailed(command);
    event.errors = responses;
    logger.error(responses);
    eventMediator.dispatch(event);
};

function dispatch(command) {
    logger.debug('Dispatching command ' + command.properties.commandName);

    let mapping = mappings.find(function (mapping) {
        return mapping.command === command.properties.commandName;
    });

    if (mapping === undefined) {
        // oops
        createError(command, 'Unable to create handler for command ' + command.properties.commandName);
        return;
    }

    // now verify and execute mapping

    // check generic command settings
    let checks = commandVerifier.verify(command);
    if (checks.length > 0) {
        // there were errors
        createError(command, checks);
        return;
    }
    logger.debug('Verified basic info for command ' + command.properties.commandName);

    // get handler
    let handler = mapping.handler;
    handler.command = command;

    handler.verify()
        .toArray()
        .subscribe(function (responses) { // we get object with keys set as response names
            const messageLength = responses.length;
            logger.info(`Verified command ${command.properties.commandName} and had ${messageLength} errors`);

            // verifier has run , so lets get its results
            if (messageLength === 0) {
                handler.execute(); // all ok, so run it
                exports.saveCommand(command); // and save
                logger.info('Command ' + command.commandName + ' executed successfully');
            } else {
                // verification errors found
                createError(command, responses);
            }
        }, function (err) {
            createError(command, err.toString());
        });
}

module.exports = exports = {
    init: init,
    dispatch: dispatch,
    createCommand: createCommand,
    saveCommand: saveCommand
};
