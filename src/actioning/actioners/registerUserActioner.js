var dbUtil = require('../../db/dbUtil');
var q = require('q');
var util = require('util');
var Login = require('../../models/login');

function registerUserActioner(command, log) {
    var ret = q.defer();

    // this is not strictly correct CQRS, as it should raise events

    // check whether user has a login
    dbUtil(log)
        .then(function (db) {
            db.collection('logins').count({userName: command.userName}, function (err, count) {
                if (count > 0) {
                    // oops duplicate
                    ret.reject([`The username ${command.userName} is a duplicate`]);
                } else {
                    var login = new Login(command.name, command.userName, command.password);
                    db.collection('logins').insertOne(login);
                    ret.resolve('Register user ' + login.name);
                }
            });
        })
        .catch(function (err) {
            log.error(err);
            ret.reject(err);
        });

    return ret.promise;
}

module.exports.action = registerUserActioner;
