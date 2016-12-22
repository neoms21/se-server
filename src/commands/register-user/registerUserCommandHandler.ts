import MongoRepository from '../../db/mongo-repository';
import {EventMediator} from '../../cqrs/event-mediator';
import {RegisterUserCommand} from './register-user-command';
import {Observable, Subject} from 'rxjs';
import {CommandHandlerBase} from '../../bases/Command-handler-base';
import {UserRegisteredEvent} from './user-registered-event';

export class RegisterUserCommandHandler extends CommandHandlerBase<RegisterUserCommand> {


    constructor(command: RegisterUserCommand) {
        super(command);
    }

    verify(): Observable<string> {
        let response = new Subject<string>();

        if (this.command.name === undefined || this.command.name === null) {
            response.next('registerUser command name property was not defined');
        }

        if (this.command.email === undefined || this.command.email === null) {
            response.next('registerUser command email property was not defined');
        }

        if (this.command.password === undefined || this.command.password === null) {
            response.next('registerUser command password property was not defined');
        } else {
            if (this.command.password.length < 6) {
                response.next('password must be at least 6 characters long');
            }
        }

        // check that the user is not sending a duplicate
        MongoRepository.getCount('logins', {userName: this.command.email})
            .subscribe(count => {
                if (count > 0) {
                    // oops duplicate
                    response.next(`The username ${this.command.email} is a duplicate`);
                }
            }, err => response.error(err));

        return response;
    }

    public execute(command: RegisterUserCommand) {
        // has been verified , so just need to create event
        let event = EventMediator.create(UserRegisteredEvent.prototype, command);
        Object.assign(event, command);
        EventMediator.dispatch(event);
    }

}

//module.exports = registerUserCommand;
