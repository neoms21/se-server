'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function handleRegisterUser(event) {

    console.log('in squad creation')

    let squad = {
        name: event.command.squadName,
    };
    GeneralServices.applyCommonFields(squad, event);
    MongoRepository.insert('squads', squad);
}

function getMessages() {
    return ['CreateSquadEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: handleRegisterUser,
    getMessages: getMessages
};
