import MongoRepository from '../../db/mongo-repository';
import {EventMediator} from '../../cqrs/event-mediator';
import {RegisterUserCommand} from './register-user-command';
import {Observable, Subject} from 'rxjs';
import {CommandHandlerBase} from '../../bases/Command-handler-base';
import {UserRegisteredEvent} from './user-registered-event';
import {isUndefined} from 'util';

export class RegisterUserCommandHandler extends CommandHandlerBase<RegisterUserCommand> {


    constructor(command: RegisterUserCommand) {
        super(command);
    }

    verify(): Observable<string[]> {

        let response = new Subject<string[]>();
        let errors: Array<string> = [];

        if (isUndefined(this.command.name)) {
            errors.push('RegisterUser command name property was not defined');
        }

        if (isUndefined(this.command.email)) {
            errors.push('RegisterUser command email property was not defined');
        }

        if (this.command.password === undefined || this.command.password === null) {
            errors.push('RegisterUser command password property was not defined');
        } else {
            if (this.command.password.length < 6) {
                errors.push('password must be at least 6 characters long');
            }
        }

        // check that the user is not sending a duplicate
        MongoRepository.getCount('logins', {userName: this.command.email})
            .subscribe(count => {

                if (count > 0) {
                    // oops duplicate
                    errors.push(`The username ${this.command.email} is a duplicate`);
                }

                response.next(errors);
                // we are done
                response.complete();
            }, err => {
                response.error(err)
            });

        return response;
    }

    public execute(): void {
        // has been verified , so just need to create event
        let event = EventMediator.create(UserRegisteredEvent.prototype, this.command);
        Object.assign(event, this.command);
        EventMediator.dispatch(event);
    }

}

