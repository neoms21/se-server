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

    MongoRepository.getCount('logins', {userName: event.userName})
        .subscribe(function (count) {
            if (count > 0) {
                // oops duplicate
                logger.error(`The user name ${event.userName} is a duplicate`);
            } else {
                let login = {name: event.name, userName: event.userName, password: event.password};
                GeneralServices.applyCommonFields(login, event);
                MongoRepository.insert('logins', login);
            }
        }, function (err) {
            logger.error(err)
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
