'use strict';
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');
const MongoRepository = require('../../db/mongo-repository');

function verify() {
  let response = new Rx.Subject();

  setTimeout(function (command) { // use timeout as rx is async

    if (util.isNullOrUndefined(command.payload.squad)) {
      response.next({squad: 'Squad property was not defined'});
    }

    if (util.isNullOrUndefined(command.payload.matchDate)) {
      response.next({matchDate: 'MatchDate property was not defined'});
    }

    if (util.isNullOrUndefined(command.payload.opposition)) {
      response.next({opposition: 'Opposition property was not defined'});
    }

    // check the player positions as well
    if (!util.isNullOrUndefined(command.payload.playerPositions)) {
      let playerPositionsErrors = [];
      command.payload.playerPositions.forEach((playerPos, index) => {
        playerPositionsErrors[index] = {};

        if (util.isNullOrUndefined(playerPos.Position)) {
          playerPositionsErrors[index].Position = 'Position was not defined';
        }
        if (util.isNullOrUndefined(playerPos.Player)) {
          playerPositionsErrors[index].Player = 'Player was not defined';
        }
      });

      response.next(playerPositionsErrors);
    }

    MongoRepository.getCount('matches', {squad: command.payload.squad, matchDate: command.payload.matchDate})
      .subscribe(function (count) {

        if (count > 0) {
          // oops duplicate
          response.next('There is already a match for that squad and date');
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
  let event = EventFactory.createFromCommand(this.command, 'CreateMatchEvent', false);

  // now send it
  EventMediator.dispatch(event);
}

module.exports = {
  verify: verify,
  execute: execute,
  getCommand: () => 'CreateMatch'
};

