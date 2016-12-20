import {Logger} from 'bunyan';
import MongoRepository from '../db/mongo-repository';
import {SaveCommandErrorEvent} from './events/Save-command-error-event';
const fs = require('fs');
const path = require('path');
const q = require('q');
const Rx = require('rx');
const CommandExecuting = require('./../commands/models/command-executing');
const CommandExecuted = require('./../commands/models/command-executed');
const CommandMediatorInitiating = require('./events/command-mediator-initiated');
const CommandFactory = require('./commandFactory');

export class CommandMediator {
    private static mappings = [];
    private static logger: Logger;
    public static propagator: Rx.Subject;

    constructor() {
        CommandMediator.propagator = new Rx.Subject();
    }

    public static init(logger: Logger) {
        // save logger
        CommandMediator.logger = logger;

        // find all the actions
        fs.readdir(__dirname + '/commands/*Command*.*', function (err, filenames) {
            if (err) {
                this.propagator.onError(err);
            } else {
                filenames.forEach(function (filename) {
                    if (filename.indexOf('Test') === -1) { // it is real command handler
                        let mapping = {
                            code: path.basename(filename).slice(0, filename.length - 10),
                            path: path.join('handlers', filename)
                        };
                        this.mappings.push(mapping);
                    }
                });
                console.info('CommandMediator has been initiated');
            }
        });

    }

    // public static getObservable() {
    //     return propagator;
    // }

    private static saveCommand(command) {
        let ret = q.defer();
        MongoRepository.insert(command)
            .subscribe(r => this.propagator.onNext(new ),
                        err => this.propagator.onError(new SaveCommandErrorEvent(command.correlationId))
            })
            .catch(function (err) {
                ret.reject(err);
            });

        return ret.promise;
    }

    private static

    public static dispatch(command) {
        let ret = {status: 200, message: ''};

        let matchingHandler = this.mappings.find(function (item) {
            return item.code === command.code;
        });

        if (matchingHandler !== undefined) {
            // found handler entry
            const handler = require('./common/' + matchingHandler.code + 'Command');
            handler.command = command;
            let errors = handler(command).verify()
                .subscribe(r => {

                }, );

            if (errors.length === 0) {
                let msg = new CommandExecuting(command.correlationId);
                this.propagator.onNext(msg);

                // actually action the command
                CommandFactory.start(matchingHandler.path, command)
                    .subscribe(resp => {
                        // put it on
                        this.propagator.onNext(resp);
                    }, err => {
                        this.propagator.onError(err);
                    }, () => {
                        // finished so send end response
                        let msg = new CommandExecuted(command.correlationId);
                        this.propagator.onNext(msg);
                        this.saveCommand(command);
                    });

                // tell client we have executed command
                ret.message = `Command ${command.code} being executed`;
            } else {
                ret.status = 501;
                ret.message = errors.toString();
            }

        } else {
            ret.message = "Couldn't find " + command.code + " command";
            ret.status = 501;
        }

        return ret;
    }
}

//
// module.exports = {
//     init: init,
//     dispatch: dispatch,
//     getObservable: getObservable
// };
