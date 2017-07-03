'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function createSquad(event) {
    console.log(event);

    let squad = {
        name: event.command.payload.squadName,
        userId: event.command.payload.userId,
    };
    MongoRepository.insert('squads', squad);
}

function getMessages() {
    return ['CreateSquadEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: createSquad,
    getMessages: getMessages
};
