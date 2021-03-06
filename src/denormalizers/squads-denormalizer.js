'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function createSquad(event) {
    let squad = {
        name: event.command.payload.squadName,
        userId: event.command.payload.userId,
    };
    GeneralServices.applyCommonFields(squad);
    MongoRepository.insert('squads', squad);
}


function deleteSquad(event) {
    MongoRepository.deleteRecord('squads', event.command.payload);
}

function handleMessage(event) {

    switch (event.properties.eventName) {

        case 'CreateSquadEvent':
            createSquad(event);
            break;
        case 'DeleteSquadEvent':
            deleteSquad(event);
            break;
    }
}

function getMessages() {
    return ['CreateSquadEvent', 'DeleteSquadEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: handleMessage,
    getMessages: getMessages
};
