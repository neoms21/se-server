// class CreateSquadCommand {
//     commandName;
//     correlationId;
//     squadName;
//
// }


'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');

const execute = (command) => {

    console.log(command);
    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(command, 'CreateSquadEvent', false);
    Object.assign(event, { command: command });

    // now send it
    EventMediator.dispatch(event);
};

const verify = () => {
    return Rx.Observable.empty();
};

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreateSquad"
};
