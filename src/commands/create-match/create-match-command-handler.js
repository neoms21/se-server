'use strict';
const MongoRepository = require('../../db/mongo-repository');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');

function verify() {
    let response = new Rx.Subject();

    setTimeout(function (command) { // use timeout as rx is async

        if (util.isNullOrUndefined(command.squad)) {
            response.next({squad: 'Squad property was not defined'});
        }

        if (util.isNullOrUndefined(command.matchDate)) {
            response.next({matchDate: 'MatchDate property was not defined'});
        }

        if (util.isNullOrUndefined(command.opposition)) {
            response.next({opposition: 'Opposition property was not defined'});
        }

        // we are done
        response.complete();

    }, 100, this.command);

    return response;
}

function execute() {
    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'CreateMatchEvent', false);

    // now send it
    EventMediator.dispatch(event);
}

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreateMatch"
};

