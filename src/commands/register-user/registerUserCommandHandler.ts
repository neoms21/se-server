import {ICommand} from '../../bases/ICommand';
import {CommandHandlerBase} from '../../bases/Command-handler-base';
import MongoRepository from '../../db/mongo-repository';
import {Rx} from 'rx';
import {EventMediator} from '../../cqrs/event-mediator';
import {RegisterUserEvent} from './register-user-event';

export class RegisterUserCommandHandler extends CommandHandlerBase {

    constructor(command: ICommand) {
        super(command);
    }

    verify() {
        let response = new Rx.Subject();

        if (this.command.name === undefined || this.command.name === null) {
            response.onNext('registerUser command name property was not defined');
        }

        if (this.command.userName === undefined || this.command.userName === null) {
            response.onNext('registerUser command userName property was not defined');
        }

        if (this.command.password === undefined || this.command.password === null) {
            response.onNext('registerUser command password property was not defined');
        } else {
            if (this.command.password.length < 6) {
                response.onNext('password must be at least 6 characters long');
            }
        }

        // check that the user is not sending a duplicate
        MongoRepository.getCount('logins', {userName: this.command.userName})
            .subscribe(count => {
                if (count > 0) {
                    // oops duplicate
                    response.onNext(`The username ${this.command.userName} is a duplicate`);
                }
            }, err => response.onError(err));

        return response;
    }

    public execute(command: ICommand) {
        EventMediator.dispatch(new RegisterUserEvent(command.name));
    }

}

//module.exports = registerUserCommand;
