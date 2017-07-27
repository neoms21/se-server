'use strict';
const MongoRepository = require('../../db/mongo-repository');
const Rx = require('rxjs');
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const EventFactory = require('../../cqrs/event-factory');
const ObjectId = require('mongodb').ObjectId;


function execute() {
    let event = EventFactory.createFromCommand(this.command, 'CreatePlayerEvent', false);
    EventMediator.dispatch(event);
}

function verify() {
    let response = new Rx.Subject();
    setTimeout(function (command) { // use timeout as rx is async
        if (util.isNullOrUndefined(command.payload.player.playerName)) {
            response.next({squadName: 'Player name is mandatory'});
            return;
        }

        MongoRepository.query('squads', {_id: new ObjectId(command.payload.player.squadId)})
            .subscribe(squad => {

                if (command.payload.player.age < 8) {
                    response.next({'age': 'Players' / 's age should be more than 8 years'});
                }
                if (!squad) {
                    response.next({'squadName': 'Selected Squad doesn' / 't exists'});
                }

                let existingPlayer = squad.players ? squad.players.find(p => {
                    return p.email === command.payload.player.email && !p.id;
                }) : undefined;

                if (existingPlayer) {
                    response.next({'email': 'Email already exists'});
                }
                response.complete();
            });
    }, 100, this.command);

    return response;
}

module.exports = {
    verify: verify,
    execute: execute,
    getCommand: () => "CreatePlayer"
};
