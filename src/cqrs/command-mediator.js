'use strict';
const path = require('path');
const Rx = require('rxjs');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const eventMediator = require('./event-mediator');
const cqrsEventCreator = require('./cqrs-event-creator');
const commandVerifier = require('./commandVerifier');
const generalServices = require('./general-services');

let mappings = [];
let logger;
let propagator = new Rx.Subject();

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
                        // make sure it's initialised
                        instance.init(logger);
                        // add to our list
                        mappings.push(mapping);
                    }

                    log.info('Added command ' + mapping.command);
                });
            }
        });
}

function saveCommand(command) {

    generalServices.applyCommonFields(command, command);

    // save to db
    mongoRepository.insert('commands', command)
        .subscribe(function () {
                let event = cqrsEventCreator.CommandSaved(command);
                eventMediator.dispatch(event);
            }, function (err) {
                let event = cqrsEventCreator.SaveCommandError(command);
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
    if (request.hasOwnProperty("commandName")) {

        // create it now
        instance = {commandName: request.commandName, correlationId: request.correlationId, clientId: clientId};

        // add extra props
        Object.assign(instance, request.payload);
    }

    return instance;
}

let createError = function (command, responses) {
    let event = cqrsEventCreator.CommandVerificationFailed(command);
    event.errors = responses;
    logger.error(responses);
    eventMediator.dispatch(event);
};

function dispatch(command) {

    let mapping = mappings.find(function (mapping) {
        return mapping.command === command.commandName;
    });

    if (mapping === undefined) {
        // oops
        createError(command, {'@#@': 'Unable to create handler for command ' + command.commandName});
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

    // get handler
    let handler = require(mapping.path);
    handler.command = command;

    handler.verify()
        .reduce((oldVal, newVal) => {
            oldVal[Object.keys(newVal)[0]] = newVal;
            return oldVal;
        })// get keys for the results from verify
        .subscribe(function (responses) { // we get object with keys set as response names
            const messageLength = Object.keys(responses).length;
            console.log('@@@@@@ ', responses)

            // verifier has run , so lets get its results
            if (messageLength === 0) {
                handler.execute(); // all ok, so run it
                exports.saveCommand(command); // and save
                propagator.next('Command ' + command.commandName + ' executed successfully');
                logger.info('Command ' + command.commandName + ' executed successfully');
            } else {
                // verification errors found
                createError(command, responses);
            }
        }, function (err) {
            createError(command, {'@#@': err.toString()});
        });
}

module.exports = {
    init: init,
    dispatch: dispatch,
    createCommand: createCommand,
    saveCommand: saveCommand
};
