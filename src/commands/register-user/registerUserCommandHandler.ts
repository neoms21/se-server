import MongoRepository from '../../db/mongo-repository';
import {EventMediator} from '../../cqrs/event-mediator';
import {RegisterUserEvent} from './register-user-event';
import {RegisterUserCommand} from './register-user-command';
import {Observable, Subject} from 'rxjs';
import {ICommandHandler} from '../../bases/ICommandHandler';
import {CommandHandlerBase} from '../../bases/Command-handler-base';

export class RegisterUserCommandHandler extends CommandHandlerBase<RegisterUserCommand> {

    execute() {
    }

    constructor(command: RegisterUserCommand) {
        super(command);
    }

    verify(): Observable<string> {
        let response = new Subject<string>();

        if (this.command.name === undefined || this.command.name === null) {
            response.next('registerUser command name property was not defined');
        }

        if (this.command.userName === undefined || this.command.userName === null) {
            response.next('registerUser command userName property was not defined');
        }

        if (this.command.password === undefined || this.command.password === null) {
            response.next('registerUser command password property was not defined');
        } else {
            if (this.command.password.length < 6) {
                response.next('password must be at least 6 characters long');
            }
        }

        // check that the user is not sending a duplicate
        MongoRepository.getCount('logins', {userName: this.command.userName})
            .subscribe(count => {
                if (count > 0) {
                    // oops duplicate
                    response.next(`The username ${this.command.userName} is a duplicate`);
                }
            }, err => response.error(err));

        return response;
    }

    public execute(command: RegisterUserCommand) {
        EventMediator.dispatch(new RegisterUserEvent(command.name));
    }

}

//module.exports = registerUserCommand;
