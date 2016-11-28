const dbUtil = require('../../db/dbUtil');
const util = require('util');
const Login = require('../models/login');
const Rx = require('rx');

function registerUserCommand() {

    let response = new Rx.Subject();

    // check whether user has a login
    dbUtil.connectToDb().subscribe((db) => {
        db.collection('logins').count({userName: this.command.userName}, (err, count) => {
            if (count > 0) {
                // oops duplicate
                response.onError([`The username ${this.command.userName} is a duplicate`]);
            } else {
                let login = new Login(this.command.name, this.command.userName, this.command.password);
                db.collection('logins').insertOne(login);
                response.onNext('Registered user ' + login.name);
                response.onCompleted();
            }
        });
    }, (err) => {
        response.onError(err);
    });

    return response;
}

module.exports = registerUserCommand;
