'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');

function execute() {


    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'CreateSquadEvent', false);
    EventMediator.dispatch(event);
}

function verify() {


    let response = new Rx.Subject();
    let errors = [];
    setTimeout(function (command) { // use timeout as rx is async
        console.log(command);
        if (util.isNullOrUndefined(command.payload.squadName)) {
            response.next({squadName: 'Squad name is mandatory'});
        }

        const squadNameToSearchFor = command.payload.squadName || '';

        // check that the user is not sending a duplicate
        MongoRepository.getCount('squads', {name: squadNameToSearchFor, userId: command.payload.userId})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    response.next({'squadName': 'Squad name ' + squadNameToSearchFor + ' already exists!!'});
                }

                // we are done
                response.complete();
            }, function (err) {
                response.error(err);
            });
    }, 100, this.command);

    return response;
}

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreateSquad"
};
