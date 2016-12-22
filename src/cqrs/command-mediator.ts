import {Logger} from 'bunyan';
import MongoRepository from '../db/mongo-repository';
import {SaveCommandErrorEvent} from './events/Save-command-error-event';
import {ICommand} from '../bases/ICommand';
import {EventMediator} from './event-mediator';
import {CommandVerificationFailedEvent} from './events/command-verification-failed-event';
import fs = require('fs');
import path = require('path');
import {SaveCommandEvent} from './events/save-command-event';
import 'rxjs/Rx';
import {Subject} from 'rxjs';
import * as uuid from 'uuid';
import {CommandRequest} from '../bases/CommandRequest';
import {CommandExecutedEvent} from './events/command-executed-event';
import {RegisterUserCommandHandler} from '../commands/register-user/registerUserCommandHandler';
import {RegisterUserCommand} from '../commands/register-user/register-user-command';

export class CommandMediator {
    private static commandFactory: any;
    private static handlerFactory: any;
    private static logger: Logger;
    public static propagator: Subject<any>;

    constructor() {
    }

    public static init(logger: Logger) {
        // save logger
        CommandMediator.logger = logger;
        // create entries
        CommandMediator.propagator = new Subject<any>();
        // add entries for handlers
        CommandMediator.handlerFactory = {};
        CommandMediator.handlerFactory.RegisterUser = RegisterUserCommandHandler;
        // add entries for commands
        CommandMediator.commandFactory = {};
        CommandMediator.commandFactory.RegisterUser = RegisterUserCommand;

        // find all the actions
        // fs.readdir(__dirname + '/commands/*Command*.*', function (err, filenames) {
        //     if (err) {
        //         CommandMediator.propagator.error(err);
        //     } else {
        //         filenames.forEach(function (filename) {
        //             if (filename.indexOf('Test') === -1) { // it is real command handler
        //                 let mapping = {
        //                     code: path.basename(filename).slice(0, filename.length - 10),
        //                     path: path.join('handlers', filename)
        //                 };
        //                 this.mappings.push(mapping);
        //             }
        //         });
        //         console.info('CommandMediator has been initiated');
        //     }
        // });
    }

    private static saveCommand(command: ICommand): void {

        // save to db
        MongoRepository.insert('commands', command)
            .subscribe((r: any) => {
                    let event = EventMediator.create(SaveCommandEvent.prototype, command);
                    EventMediator.dispatch(event);
                }, err => {
                    let event = EventMediator.create<SaveCommandErrorEvent>(SaveCommandErrorEvent.prototype, command);
                    event.error = err.toString();
                    EventMediator.dispatch(event);
                }
            );

        // log it
        this.logger.info('Saving command ' + command.id);
    }

    public static createCommand(request: CommandRequest): ICommand {
        // create it now
        //let proto = global[request.name + 'Command'].prototype;
        //console.log(proto);
        let instance = new CommandMediator.commandFactory[request.name]();

        //let instance = Object.create(request.name + 'Command');
        Object.assign(instance, request.payload);

        // add the correlation
        instance.correlationId = uuid.v4();
        // add the id
        instance.id = request.name;

        return instance;
    }

    public static dispatch(command: ICommand) {
        let ret = {status: 200, message: ''};

        // create the handler based on naming convention,, for now!
        //let proto = global[command.id + 'Command'].prototype;
        //console.log(proto);
        let handler = new CommandMediator.handlerFactory[command.id](command);
        //let handler = Object.create(command.id + 'CommandHandler');

        if (handler === undefined) {
            // oops
            this.logger.error('Unable to create handler for command ' + command.id);
            return;
        }

        // now verify and execute handler

        // set command for use in handler
        //handler.command = command;

        handler.verify() //.toArray()
            .subscribe((messages: string[]) => {
                    // verifier has run , so lets get its reults
                    if (messages.length === 0) {
                        handler.execute(); // all ok, so run it
                        this.propagator.next(`Command ${command.toString()} executed successfully`);
                    } else {

                        let event = EventMediator.create<CommandVerificationFailedEvent>(
                            CommandVerificationFailedEvent.prototype, command);
                        event.messages = messages;
                        EventMediator.dispatch(event);
                    }
                }, (err: any) => {
                    let event = EventMediator.create<CommandVerificationFailedEvent>(
                        CommandVerificationFailedEvent.prototype, command);
                    event.messages = [...err.toString()];
                    EventMediator.dispatch(event);
                }
            )
        ;

        return ret;
    }

// public static dispatch(command: ICommand) {
//     let ret = {status: 200, message: ''};
//
//     let matchingHandler = this.mappings.find(function (item: any) {
//         return item.code === command.code;
//     });
//
//     if (matchingHandler !== undefined) {
//         // found handler entry
//         const handler = require('./common/' + matchingHandler.code + 'Command');
//         handler.command = command;
//         handler(command).verify() //.toArray()
//             .subscribe((messages: string[]) => {
//                     // verifier has run , so lets get its reults
//                     if (messages.length === 0) {
//                         this.runCommand(command); // all ok, so run it
//                     } else {
//                         EventMediator.dispatch(new CommandVerificationFailedEvent(command.correlationId, messages));
//                     }
//                 }
//                 , (err: any) => EventMediator.dispatch(new CommandVerificationFailedEvent(command.correlationId, err.toString()))
//             );
//
//         // if (errors.length === 0) {
//         //     let msg = new CommandExecuting(command.correlationId);
//         //     this.propagator.onNext(msg);
//         //
//         //     // actually action the command
//         //     CommandFactory.start(matchingHandler.path, command)
//         //         .subscribe(resp => {
//         //             // put it on
//         //             this.propagator.onNext(resp);
//         //         }, err => {
//         //             this.propagator.onError(err);
//         //         }, () => {
//         //             // finished so send end response
//         //             let msg = new CommandExecuted(command.correlationId);
//         //             this.propagator.onNext(msg);
//         //             this.saveCommand(command);
//         //         });
//         //
//         //     // tell client we have executed command
//         //     ret.message = `Command ${command.code} being executed`;
//         // } else {
//         //     ret.status = 501;
//         //     ret.message = errors.toString();
//         // }
//
//     } else {
//         ret.message = "Couldn't find " + command.code + " command";
//         ret.status = 501;
//     }
//
//     return ret;
// }
}
