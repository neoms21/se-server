'use strict';
const EventMediator = require('../../cqrs/event-mediator');
const util = require('util');
const Rx = require('rxjs');
const EventFactory = require('../../cqrs/event-factory');
const uuid = require('uuid');
const logger = require('../../core/logger');

function verify() {
  let response = new Rx.Subject();

  setTimeout(function (command) { // use timeout as rx is async

    if (util.isNullOrUndefined(command.payload.matchId)) {
      response.next('matchId property was not defined');
    }

    if (util.isNullOrUndefined(command.payload.player)) {
      response.next({matchDate: 'Player property was not defined'});
    }

    if (util.isNullOrUndefined(command.payload.position)) {
      response.next({opposition: 'Position property was not defined'});
    }

    // check the player & position are valid
    // MongoRepository.getCount('squads', {players: {$elemMatch: { player: _id: command.payload.player}})
    //   .subscribe(function (count) {
    //
    //     if (count === 0) {
    //       // oops unknown player
    //       response.next(`Player ${command.payload.player} is unknown`);
    //     }
    //
    //     MongoRepository.getCount('players', {player: command.payload.player})
    //       .subscribe(function (count) {
    //
    //         if (count === 0) {
    //           // oops unknown player
    //           response.next(`Player ${command.payload.player} is unknown`);
    //         }
    //       }, function (err) {
    //         response.error(err);
    //       });
    //
    //   }, function (err) {
    //     response.error(err);
    //   });

    response.complete();

  }, 100, this.command);

  return response;
}

function execute() {

  let event = EventFactory.createFromCommand(this.command, 'SaveMatchSelectionEvent', false);
  event.payload = {
    matchId: this.command.payload.matchId,
    player: this.command.payload.player,
    position: this.command.payload.position
  };
  // now send it
  EventMediator.dispatch(event);
}

module.exports = {
  verify: verify,
  execute: execute,
  getCommand: () => 'CreateMatchSelection'
};

