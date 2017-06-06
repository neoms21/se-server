'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function handleRegisterUser(event) {
    // check whether user has a login
    //console.log('in handle register')

    MongoRepository.getCount('logins', {userName: event.command.email})
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
