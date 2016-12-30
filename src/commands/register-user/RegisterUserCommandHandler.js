'use strict';
var mongoRepository = require('../../db/mongo-repository');
var eventMediator = require('../../cqrs/event-mediator');
var util = require('util');
var Rx = require('rxjs');


var verify = function () {

    var response = new Rx.Subject();

    setTimeout(function (command) { // use timeout as rx is async
        if (util.isNullOrUndefined(command.name)) {
            response.next('RegisterUser command name property was not defined');
        }

        if (util.isNullOrUndefined(command.email)) {
            response.next('RegisterUser command email property was not defined');
        }

        if (util.isNullOrUndefined(command.password)) {
            response.next('RegisterUser command password property was not defined');
        } else {
            if (command.password.length < 6) {
                response.next('password must be at least 6 characters long');
            }
        }

        var userNameToSearchFor = command.email;

        // check that the user is not sending a duplicate
        mongoRepository.getCount('logins', {email: userNameToSearchFor})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    response.next('The email ' + userNameToSearchFor + ' is a duplicate');
                }

                // we are done
                response.complete();
            }, function (err) {
                response.error(err);
            });
    }, 100, this.command);

    return response;
};

var execute = function () {
    // has been verified , so just need to create event
    var event = {eventName: 'UserRegisteredEvent'};
    Object.assign(event, this.command);
    eventMediator.dispatch(event);
};

module.exports = {
    verify: verify,
    execute: execute,
   // verifyObserver: response
};

