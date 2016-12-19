import {RegisterUserEvent} from '../../events/register-user-event';

export class LoginsDenormalizer {
    constructor() {

    }

    handleRegisterUser(event: RegisterUserEvent) {
        // check whether user has a login
        dbUtil.getCount('logins', {userName: this.userName})
            .subscribe(count => {
                if (count > 0) {
                    // oops duplicate
                    response.onError([`The username ${this.userName} is a duplicate`]);
                } else {
                    let login = new Login(this.name, this.userName, this.password);
                    dbUtil.insert('logins', login);
                    response.onNext('Registered user ' + login.name);
                    response.onCompleted();
                }
            }, (err) => {
                response.onError(err); // pass it on
            });
    }
}
