import {Logger} from 'bunyan';
import MongoRepository from '../db/mongo-repository';
import {SaveCommandErrorEvent} from './events/Save-command-error-event';
import {ICommand} from '../bases/ICommand';
import {EventMediator} from './event-mediator';
import {CommandVerificationFailedEvent} from './events/command-verification-failed-event';
import fs = require('fs');
import path = require('path');
import {SaveCommandEvent} from './events/save-command-event';
import {Rx} from 'rx';

export class CommandMediator {
    private static mappings: Array<any>;
    private static logger: Logger;
    public static propagator: Rx.Subject<any>;

    constructor() {
        CommandMediator.mappings = [];
        CommandMediator.propagator = new Rx.Subject<any>();
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

    private static saveCommand(command: ICommand): void {

        // save to db
        MongoRepository.insert('commands', command)
            .subscribe(r => EventMediator.dispatch(new SaveCommandEvent(command.correlationId)),
                err => EventMediator.dispatch(new SaveCommandErrorEvent(command.correlationId))
            );
        // log it
        this.logger.info('Saving command ' + command.code);
    }

    private static runCommand(commandPath: string, command: ICommand) {
        // find the command handler
        let invoker = require('./' + commandPath);

        Rx.Observable.start(invoker, {command: command}) // context will be bound to this of invoker
            .subscribe(resp => {
                // worked it ok , so save it
                this.saveCommand(command);
            });
    }

    public static dispatch(command: ICommand) {
        let ret = {status: 200, message: ''};

        let matchingHandler = this.mappings.find(function (item) {
            return item.code === command.code;
        });

        if (matchingHandler !== undefined) {
            // found handler entry
            const handler = require('./common/' + matchingHandler.code + 'Command');
            handler.command = command;
            handler(command).verify().toArray()
                .subscribe(messages => {
                        // verifier has run , so lets get its reults
                        if (messages.length === 0) {
                            this.runCommand(matchingHandler.path, command); // all ok, so run it
                        } else {
                            EventMediator.dispatch(new CommandVerificationFailedEvent(messages));
                        }
                    }, err => EventMediator.dispatch(new CommandVerificationFailedEvent(err.toString()))
                );

            // if (errors.length === 0) {
            //     let msg = new CommandExecuting(command.correlationId);
            //     this.propagator.onNext(msg);
            //
            //     // actually action the command
            //     CommandFactory.start(matchingHandler.path, command)
            //         .subscribe(resp => {
            //             // put it on
            //             this.propagator.onNext(resp);
            //         }, err => {
            //             this.propagator.onError(err);
            //         }, () => {
            //             // finished so send end response
            //             let msg = new CommandExecuted(command.correlationId);
            //             this.propagator.onNext(msg);
            //             this.saveCommand(command);
            //         });
            //
            //     // tell client we have executed command
            //     ret.message = `Command ${command.code} being executed`;
            // } else {
            //     ret.status = 501;
            //     ret.message = errors.toString();
            // }

        } else {
            ret.message = "Couldn't find " + command.code + " command";
            ret.status = 501;
        }

        return ret;
    }
}
