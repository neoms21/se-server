var fs = require('fs');
var path = require('path');
var uuid = require('uuid');
var Rx = require('rxjs');

var MongoRepository = require('../db/mongo-repository');
var EventMediator = require('./event-mediator');
var cqrsEventCreator = require('./events/command-executed-event');

var commandMediator = {
    mappings: [],
    logger: {},
    propagator: new Rx.Subject()
};

commandMediator.init = function (log) {
    this.logger = log;

    // find all the handlers
    fs.readdir(__dirname + '**/*CommandHandler.js', function (err, filenames) {
        if (err) {
            CommandMediator.propagator.error(err);
        } else {
            filenames.forEach(function (filename) {
                if (filename.indexOf('Test') === -1) { // it is real command handler
                    var mapping = {
                        code: path.basename(filename).slice(0, filename.length - 10),
                        path: path.join('handlers', filename)
                    };
                    mappings.push(mapping);
                }
            });
            console.info('CommandMediator has been initiated');
        }
    });
};

commandMediator.saveCommand = function (command) {

    // save to db
    MongoRepository.insert('commands', command)
        .subscribe(function (resp) {
                var event = cqrsEventCreator.CommandSaved(command);
                EventMediator.dispatch(event);
            }, function (err) {
                var event = cqrsEventCreator.SaveCommandError(command);
                event.error = err.toString();
                EventMediator.dispatch(event);
            }
        );

    // log it
    this.logger.info('Saving command ' + command.commandName);
};

commandMediator.createCommand = function (request) {
    // create it now

    var instance = {commandName: request.commandName};

    // add extra props
    Object.assign(instance, request.payload);

    // add the correlation
    instance.correlationId = uuid.v4();

    return instance;
};

commandMediator.dispatch = function (command) {

    var handler = this.mappings.find(function (mapping) {
        return mapping.code === command.commandName
    });

    if (handler === undefined) {
        // oops
        this.logger.error('Unable to create handler for command ' + command.commandName);
        return;
    }

    handler.command = command;
    // now verify and execute handler

    this.logger.info('CommandMediator before running verify for ' + command.commandName);

    handler.verify()//.toArray()
        .subscribe(function (messages) {

                // verifier has run , so lets get its reults
                if (messages.length === 0) {
                    handler.execute(); // all ok, so run it
                    this.saveCommand(command); // and save
                    this.propagator.next('Command ' + command.commandName + ' executed successfully');
                } else {
                    var event = cqrsEventCreator.CommandVerificationFailed(command);
                    event.messages = messages;
                    EventMediator.dispatch(event);
                }
            }, function (err) {
                this.logger.error(err.toString());
                var event = cqrsEventCreator.CommandVerificationFailed(command);
                event.messages.push(err.toString());
                EventMediator.dispatch(event);
            }
        );
};

exports = commandMediator;