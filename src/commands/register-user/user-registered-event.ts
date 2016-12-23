import {EventBase} from '../../bases/EventBase';

export class UserRegisteredEvent extends EventBase {
    name : string;
    password : string;
    email : string;
    telephone : string;
    securityQuestion : string;
    securityAnswer : string;

    constructor(correlationId: string) {
        super(correlationId);
    }
}
