var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var Rx = require('rxjs');
var Filehound = require('filehound');
var mongoRepository = require('../db/mongo-repository');
var eventMediator = require('./event-mediator');
var cqrsEventCreator = require('./cqrs-event-creator');

var mappings = [];
var logger;
var propagator = new Rx.Subject();

function init(log) {
    logger = log;

    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/commands')
        .match('*CommandHandler*')
        .find(function (err, filenames) {
            if (err) {
                logger.error("error finding handlers ", err);
            } else {
                filenames.forEach(function (filename) {
                    var mapping = {
                        code: path.basename(filename).slice(0, path.basename(filename).length - 17),
                        path: filename
                    };
                    mappings.push(mapping);
                });
            }
        });


    // fs.readdir(__dirname + '/../commands/*CommandHandler.js', function (err, filenames) {
    //     if (err) {
    //         propagator.error(err);
    //     } else {
    //
    //         console.info('CommandMediator has been initiated');
    //     }
    // });
}

function saveCommand(command) {

    // save to db
    mongoRepository.insert('commands', command)
        .subscribe(function () {
                var event = cqrsEventCreator.CommandSaved(command);
                eventMediator.dispatch(event);
            }, function (err) {
                var event = cqrsEventCreator.SaveCommandError(command);
                event.error = err.toString();
                eventMediator.dispatch(event);
            }
        );

    // log it
    logger.info('Saving command ' + command.commandName);
}

function createCommand(request) {
    var instance;

    // needs command name
    if(request.hasOwnProperty("commandName")) {

        // create it now
        instance = {commandName: request.commandName};

        // add extra props
        Object.assign(instance, request.payload);

        // add the correlation
        instance.correlationId = uuid.v4();
    }

    return instance;
}

function dispatch(command) {

    var mapping = mappings.find(function (mapping) {
        return mapping.code === command.commandName;
    });

    if (mapping === undefined) {
        // oops
        logger.error('Unable to create handler for command ' + command.commandName);
        return;
    }

    var handler = require(mapping.path);

    handler.command = command;
    // now verify and execute mapping

    logger.info('CommandMediator before running verify for ' + command.commandName);

    handler.verify()//.toArray()
        .subscribe(function (messages) {

                // verifier has run , so lets get its reults
                if (messages.length === 0) {
                    handler.execute(); // all ok, so run it
                    saveCommand(command); // and save
                    propagator.next('Command ' + command.commandName + ' executed successfully');
                } else {
                    var event = cqrsEventCreator.CommandVerificationFailed(command);
                    event.messages = messages;
                    eventMediator.dispatch(event);
                }
            }, function (err) {
                logger.error(err.toString());
                var event = cqrsEventCreator.CommandVerificationFailed(command);
                event.messages.push(err.toString());
                eventMediator.dispatch(event);
            }
        );
}

module.exports = {
    init: init,
    dispatch: dispatch,
    createCommand: createCommand,
    saveCommand: saveCommand
};