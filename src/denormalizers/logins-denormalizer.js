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
    logger.error('Event needs to be defined');
    return;
  }

  // check whether user has a login

  mongoRepository.getCount('logins', {userName: event.command.email})
    .subscribe(function (count) {
      if (count > 0) {
        // oops duplicate
        logger.error(`The user name ${event.command.email} is a duplicate`);
      } else {
        let login = {
          name: event.command.name,
          userName: event.command.email,
          password: event.command.password
        };
        GeneralServices.applyCommonFields(login, event);
        mongoRepository.insert('logins', login);
      }
    }, function (err) {
      logger.error(err);
    });
}

function getMessages() {
  return ['UserRegisteredEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
  init: init,
  handleMessage: handleRegisterUser,
  getMessages: getMessages
};
