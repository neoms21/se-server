'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');

function execute() {


    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'DeleteSquadEvent', false);
    EventMediator.dispatch(event);
}

function verify() {


    let response = new Rx.Subject();

    setTimeout(function (command) { // use timeout as rx is async
        // we are done
        response.complete();
    }, 100, this.command);

    return response;
}

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "DeleteSquad"
};
