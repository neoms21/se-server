'use strict';
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');
const MongoRepository = require('../../db/mongo-repository');
const ObjectId = require('mongodb').ObjectId;
const uuid = require('uuid');
const logger = require('../../core/logger');

function verify() {
  let response = new Rx.Subject();

  setTimeout(function (command) { // use timeout as rx is async

    // if (util.isNullOrUndefined(command.payload.matchId)) {
    //   response.next({squad: 'matchId property was not defined'});
    // }

    if (util.isNullOrUndefined(command.payload.player)) {
      response.next({matchDate: 'Player property was not defined'});
    }

    if (util.isNullOrUndefined(command.payload.position)) {
      response.next({opposition: 'Position property was not defined'});
    }

    // check the player not already added

    MongoRepository.getCount('matches', {playerPositions: {$elemMatch: {
        player: command.payload.player, position: command.payload.position }}})
      .subscribe(function (count) {

        if (count > 0) {
          // oops duplicate
          response.next('There is already a match for that squad and date');
        }
        
      }, function (err) {
        response.error(err);
      });

  }, 100, this.command);

  return response;
}

function execute() {

  // get squad name for event
  MongoRepository.query('squads', {_id: ObjectId(this.command.payload.squad)}, {name: 1})
    .subscribe((squad) => {
      let event = EventFactory.createFromCommand(this.command, 'CreateMatchEvent', false);
      event.payload = {
        matchId: uuid.v4(),
        squadName: squad.name,
        matchDate: this.command.payload.matchDate,
        position: this.command.payload.position
      };
      // now send it
      EventMediator.dispatch(event);
    }, (err) => {
      //todo: log problem
    });

}

module.exports = {
  verify: verify,
  execute: execute,
  getCommand: () => 'CreateMatch'
};

