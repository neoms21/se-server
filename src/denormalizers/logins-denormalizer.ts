import {MongoRepository} from '../db/mongo-repository';
import {RegisterUserEvent} from '../commands/register-user/register-user-event';

function handleRegisterUser(event: RegisterUserEvent) {
    // check whether user has a login
    MongoRepository.getCount('logins', {userName: this.userName})
        .subscribe(count => {
            if (count > 0) {
                // oops duplicate
                response.onError([`The username ${this.userName} is a duplicate`]);
            } else {
                let login = new Login(this.name, this.userName, this.password);
                MongoRepository.insert('logins', login);
                response.onNext('Registered user ' + login.name);
                response.onCompleted();
            }
        }, (err) => {
            response.onError(err); // pass it on
        });
}

module.exports = {
    handleRegisterUser: handleRegisterUser
};
