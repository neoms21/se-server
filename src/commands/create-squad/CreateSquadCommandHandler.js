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


    let response = new Rx.Subject();
    let errors = [];
    setTimeout(function (command) { // use timeout as rx is async
        console.log(command);
        if (util.isNullOrUndefined(command.payload.squadName)) {
            errors.push({squadName: 'Squad Name is mandatory'});
        }

        const squadNameToSearchFor = command.payload.squadName || '';

        // check that the user is not sending a duplicate
        MongoRepository.getCount('squads', {name: squadNameToSearchFor})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    errors.push({'squadName': 'The squad ' + squadNameToSearchFor + ' is a duplicate'});
                }

                // we are done
                response.next(errors);
            }, function (err) {
                response.error(err);
            });
    }, 100, this.command);

    return response;
};

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreateSquad"
};
