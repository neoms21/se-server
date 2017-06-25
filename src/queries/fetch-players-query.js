'use strict';
const MongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs');
const ObjectId = require('mongodb').ObjectId;

const logger = require('../core/logger').logger();
const EventFactory = require('./../cqrs/event-factory');
const execute = (query) => {
  console.log(query);
  const ret = new Rx.Subject();
  let items = [];
  MongoRepository.query('squads', {_id: ObjectId(query.payload.id)}, {players: 1})
    .subscribe(function (x) {
      items.push(x);
    }, function (err) {
      logger.error(err);
      ret.error(err);
    }, function () {
      logger.info(`Players found for squad id ${query.payload.id} ${items}`);
      let event = EventFactory.createFromQuery(query, 'FetchPlayersEvent', false);
      event.messageNumber = 1;
      event.maxMessages = 1;
      event.data = items[0].players;
      ret.next(event);
    });
  return ret;
};

const verify = () => {
  // send back empty
  return Rx.Observable.empty();
};

module.exports = {
  verify: verify,
  execute: execute,
  getQuery: () => "FetchPlayers"
};
