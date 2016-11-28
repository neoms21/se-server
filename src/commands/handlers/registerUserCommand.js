const dbUtil = require('../../db/dbUtil');
const util = require('util');
const Login = require('../models/login');
const Rx = require('rx');

function registerUserCommand() {

    const response = dbUtil.connectToDb();

    // check whether user has a login
    response.subscribe((db) => {
        db.collection('logins').count({userName: this.command.userName}, (err, count) => {
            if (count > 0) {
                // oops duplicate
                response.onError([`The username ${this.command.userName} is a duplicate`]);
            } else {
                let login = new Login(this.command.name, this.command.userName, this.command.password);
                db.collection('logins').insertOne(login);
                response.onNext('Register user ' + login.name);
            }
        });
    }, (err) => {
        response.onError(err);
    });

    return response;
}

module.exports = registerUserCommand;
