'use strict';
const MongoRepository = require('../../db/mongo-repository');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');

function verify() {
    const response = new Rx.Subject();

    setTimeout(function (command) { // use timeout as rx is async

        if (util.isNullOrUndefined(command.payload.userName)) {
            response.next({field: 'name', message: 'Name property was not defined'});
        }

        if (util.isNullOrUndefined(command.payload.password)) {
            response.next({field: 'password', message: 'Password property was not defined'});
        }

        const userNameToSearchFor = command.payload.userName || '';

        // check that the user is not sending a duplicate
        MongoRepository.getCount('logins', {userName: userNameToSearchFor})
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
}

function execute() {

    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'SigninUserEvent', false);
    Object.assign(event, { command: this.command });

    // now send it
    EventMediator.dispatch(event);
}

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "SigninUser"
};


