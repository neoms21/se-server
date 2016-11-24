var dbUtil = require('../../db/dbUtil');
var util = require('util');
var Login = require('../models/login');

function registerUserCommand() {


    // check whether user has a login
    dbUtil(this.log)
        .then((db) => {
            db.collection('logins').count({userName: this.command.userName}, (err, count) => {
                if (count > 0) {
                    // oops duplicate
                    this.responder.onError([`The username ${this.command.userName} is a duplicate`]);
                } else {
                    let login = new Login(this.command.name, this.command.userName, this.command.password);
                    db.collection('logins').insertOne(login);
                    this.responder.onNext('Register user ' + login.name);
                }
            });
        })
        .catch((err) => {
            //this.log.error(err);
            this.responder.onError(err);
        });
}

module.exports = registerUserCommand;
