import {ICommand} from '../../bases/ICommand';

export class RegisterUserCommand implements ICommand {
    id: string;
    correlationId: string;
    code: string;
    name : string;
    password : string;
    email : string;
    telephone : string;
    securityQuestion : string;
    securityAnswer : string;

}
