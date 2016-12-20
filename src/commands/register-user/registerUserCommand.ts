import {ICommandHandler} from '../../bases/ICommandHandler';
import {ICommand} from '../../bases/ICommand';
import {CommandHandlerBase} from '../../bases/Command-handler-base';
import MongoRepository from '../../db/mongo-repository';
import {Rx} from 'rx';

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
            });

        return response;
    }

    public execute() {

    }

}

//module.exports = registerUserCommand;
