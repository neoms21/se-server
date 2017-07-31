'use strict';
const MongoRepository = require('../db/mongo-repository');
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
    // check whether user has a login
    logger.info('User Denormalizer Event', event);

    MongoRepository.getCount('logins', {userName: event.command.payload.email})
        .subscribe(function (count) {
            if (count > 0) {
                // oops duplicate
                logger.error(`The user name ${event.command.email} is a duplicate`);
            } else {
                let login = {
                    name: event.command.payload.name,
                    userName: event.command.payload.email,
                    password: event.command.payload.password
                };
                GeneralServices.applyCommonFields(login, event);
                MongoRepository.insert('logins', login);
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
