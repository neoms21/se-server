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
      let errorCount = 0;

      command.payload.playerPositions.forEach((playerPos, index) => {
        playerPositionsErrors[index] = {};
        if (util.isNullOrUndefined(playerPos.position)) {
          playerPositionsErrors[index].position = 'Position was not defined';
          errorCount++;
        }
        if (util.isNullOrUndefined(playerPos.player)) {
          playerPositionsErrors[index].player = 'Player was not defined';
          errorCount++;
        }
      });

      if (errorCount > 0) response.next({playerPositions: playerPositionsErrors});
    }

    MongoRepository.getCount('matches', {squad: command.payload.squad, matchDate: command.payload.matchDate})
      .subscribe(function (count) {

        if (count > 0) {
          // oops duplicate
          response.next('There is already a match for that squad and date');
        }

        // check that squad is valid
        MongoRepository.getCount('squads', {_id: new ObjectId(command.payload.squad)})
          .subscribe(function (count) {
            if (count === 0) {
              response.next('There is no squad for id ' + command.payload.squad);
            }
            // we are done
            response.complete();
          });
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
        opposition: this.command.payload.opposition,
        selections: this.command.payload.positions
      };
      // now send it
      EventMediator.dispatch(event);
    }, (err) => {
      logger.error(err);
    });

}

module.exports = {
  verify: verify,
  execute: execute,
  getCommand: () => 'CreateMatch'
};

