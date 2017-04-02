'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');

function execute() {

    console.log(this.command);
    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'CreateSquadEvent', false);
    // Object.assign(event, { command: this.command });

    // now send it
    EventMediator.dispatch(event);
};

function verify() {

    return Rx.Observable.of([]);
    // var response = new Rx.Subject();
    //
    // setTimeout(function (command) { // use timeout as rx is async
    //     console.log(command);
    //     if (util.isNullOrUndefined(command.name)) {
    //         response.next({name: 'Name property was not defined'});
    //     }
    //
    //     if (util.isNullOrUndefined(command.email)) {
    //         response.next({email: 'Email property was not defined'});
    //     }
    //
    //     if (util.isNullOrUndefined(command.password)) {
    //         response.next({password: 'Password property was not defined'});
    //     } else {
    //         if (command.password.length < 8) {
    //             response.next({password: 'Password must be at least 8 characters long'});
    //         }
    //     }
    //
    //     const userNameToSearchFor = command.email || '';
    //
    //     // check that the user is not sending a duplicate
    //     MongoRepository.getCount('logins', {userName: userNameToSearchFor})
    //         .subscribe(function (count) {
    //
    //             if (count > 0) {
    //                 // oops duplicate
    //                 response.next({'email': 'The email ' + userNameToSearchFor + ' is a duplicate'});
    //             }
    //
    //             // we are done
    //             response.complete();
    //         }, function (err) {
    //             response.error(err);
    //         });
    // }, 100, {});
    //
    // return response;
};

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreateSquad"
};
