'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function fetchSquads(event) {
    console.log(event);
    MongoRepository.query('squads', {});
}

function getMessages() {
    return ['CreateSquadEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: fetchSquads,
    getMessages: getMessages
};
