'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');

function execute() {


    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'DeletePlayerEvent', false);
    EventMediator.dispatch(event);
}

function verify() {

    let response = new Rx.Subject();
    setTimeout(function (command) { // use timeout as rx is async
        if (util.isNullOrUndefined(command.payload.player.squadId)) {
            response.next({squadName: 'Unable to delete, missing squad id'});
        }
        if (util.isNullOrUndefined(command.payload.player.id)) {
            response.next({squadName: 'Unable to delete, missing player id'});
        }

        // check that player to be deleted exists in the system
        MongoRepository.query('squads', {"players.id": command.payload.player.id})
            .subscribe(function (squad) {

                if (!squad) {
                    // oops duplicate
                    response.next({'playerName': 'Player doesn\'t exist!!'});
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
    getCommand: () => "DeletePlayer"
};

