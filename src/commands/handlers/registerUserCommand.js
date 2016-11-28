const dbUtil = require('../../db/dbUtil');
const util = require('util');
const Login = require('../models/login');
const Rx = require('rx');

function registerUserCommand() {

    let response = new Rx.Subject();

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

    return response;
}

module.exports = registerUserCommand;
