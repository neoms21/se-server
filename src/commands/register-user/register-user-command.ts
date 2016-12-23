import {ICommand} from '../../bases/ICommand';

export class RegisterUserCommand implements ICommand {
    commandName: string;
    correlationId: string;
    name : string;
    password : string;
    email : string;
    telephone : string;
    securityQuestion : string;
    securityAnswer : string;

}
