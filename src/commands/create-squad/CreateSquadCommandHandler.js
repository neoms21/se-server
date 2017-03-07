'use strict';
const MongoRepository = require('../../db/mongo-repository');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');

function verify() {
    var response = new Rx.Subject();

    setTimeout(function (command) { // use timeout as rx is async

        console.log(command);
        if (util.isNullOrUndefined(command.squadName)) {
            response.next({field: 'name', message: 'Squad Name was not defined'});
        }

        const squadNameToSearchFor = command.squadName || '';

        // check that the user is not sending a duplicate
        MongoRepository.getCount('squads', {name: squadNameToSearchFor})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    response.next('The squad ' + squadNameToSearchFor + ' is a duplicate');
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
    let event = EventFactory.create(this.command, 'CreateSquadEvent', false);
    Object.assign(event, { command: this.command });

    // now send it
    EventMediator.dispatch(event);
}

module.exports = {
    verify: verify,
    execute: execute
};

