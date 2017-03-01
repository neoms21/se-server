'use strict';
const MongoRepository = require('../../db/mongo-repository');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');

function verify() {
    var response = new Rx.Subject();
    console.log('in verify fetch squads');
    setTimeout(function () {
            response.complete();
        }, 100
    );

    return response;
}

function execute() {

    // has been verified , so just need to create event
    let event = EventFactory.create(this.command, 'FetchSquadsEvent', false);
    Object.assign(event, {command: this.command});

    // now send it
    EventMediator.dispatch(event);
}

module.exports = {
    verify: verify,
    execute: execute
};

