'use strict';
const mongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');
const util = require('util');

let logger;

function init(log) {
  logger = log;
}

function handleRegisterUser(event) {

  // check parms
  if (util.isNullOrUndefined(event)) {
    logger.error('Event needs to be defined');
    return;
  }

  if (util.isNullOrUndefined(event.command)) {
    logger.error('Command needs to be defined');
    return;
  }

  // check whether match already exists
  mongoRepository.getCount('matches', {
      id: event.command.id
    })
    .subscribe(function(count) {
      let match =  Object.assign(event.command.properties);
      GeneralServices.applyCommonFields(match, event);

      if (count > 0) {
        // duplicate so update
        mongoRepository.update('matches', match);
      } else {

        mongoRepository.insert('matches', match);
      }
    }, function(err) {
      logger.error(err);
    });
}

function getMessages() {
  return ['CreateMatchEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
  init: init,
  handleMessage: handleRegisterUser,
  getMessages: getMessages
};
