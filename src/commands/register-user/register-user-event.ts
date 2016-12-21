export class RegisterUserEvent {
    name : string;
    password : string;
    email : string;
    telephone : string;
    securityQuestion : string;
    securityAnswer : string;

    constructor(name: string) {
        this.name = name;
    }
}
