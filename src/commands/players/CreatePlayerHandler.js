'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const config = require('config');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');
const ObjectId = require('mongodb').ObjectId;
function execute() {


    // has been verified , so just need to create event
    let event = EventFactory.createFromCommand(this.command, 'CreatePlayerEvent', false);
    EventMediator.dispatch(event);
}

function verify() {


    let response = new Rx.Subject();
    let errors = [];
    setTimeout(function (command) { // use timeout as rx is async
        console.log(command);
        if (util.isNullOrUndefined(command.payload.player.playerName)) {
            response.next({squadName: 'Player name is mandatory'});
            return;
        }

        const playerNameToSearchFor = command.payload.player.name || '';

        MongoRepository.query('squads', {_id: new ObjectId(command.payload.player.squadId)})
            .subscribe(squad => {
                if (!squad) {
                    response.next({'squadName': 'Selected Squad doesn' / 't exists'});
                    return;
                }

            });
        command.player = command.payload.player;
        // check that the user is not sending a duplicate
        MongoRepository.getCount('players', {name: playerNameToSearchFor})
            .subscribe(function (count) {

                if (count > 0) {
                    // oops duplicate
                    response.next({'squadName': 'Squad name ' + playerNameToSearchFor + ' already exists!!'});
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
    getCommand: () => "CreatePlayer"
};
