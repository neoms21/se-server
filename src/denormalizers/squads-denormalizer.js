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
    MongoRepository.insert('squads', squad);
}


function deleteSquad(event) {
    let squad = {
        name: event.command.payload.squadName,
        userId: event.command.payload.userId,
    };

    GeneralServices.applyCommonFields(squad, event);
    MongoRepository.deleteRecord('squads', squad);
}

function handleMessage(event) {
    console.log(event);
    switch (event.properties.eventName) {

        case 'CreateSquadEvent':
            createSquad(event);
            break;
        case 'DeleteSquadEvent':
            deleteSquad(event);
            break;
    }
    createSquad();
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
