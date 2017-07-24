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
        if (util.isNullOrUndefined(command.payload)) {
            response.next({squadName: 'Unable to delete, missing id'});
        }

        // check that the user is not sending a duplicate
        MongoRepository.getCount('squads', {_id: command.payload})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    response.next({'squadName': 'Squad doesn\'t exist!!'});
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
    getCommand: () => "DeleteSquad"
};
