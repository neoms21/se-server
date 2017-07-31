'use strict';
const MongoRepository = require('../db/mongo-repository');
const ObjectId = require('mongodb').ObjectId;
let logger;

const GeneralServices = require('../cqrs/general-services');

const Guid = require('uuid');

function init(log) {
    logger = log;
}

function createOrUpdatePlayer(event, toDelete) {

    let player = event.command.payload.player;
    MongoRepository.query('squads', {_id: new ObjectId(player.squadId)})
        .subscribe(squad => {
            if (!squad.players) {
                squad.players = [];
            }
            if (player.id) {
                squad.players = squad.players.filter((p) => {
                    return p.id !== player.id;
                });
            } else {
                player.id = Guid.v4();
            }
            GeneralServices.applyCommonFields(player);
            if (toDelete) {
                player.isDeleted = true;
            }
            squad.players.push(player);

            MongoRepository.update('squads', player.squadId, {
                players: squad.players, "properties.modified": new Date()
            });
        });
}
function handleMessage(event) {

    switch (event.properties.eventName) {

        case 'CreatePlayerEvent': //also updates the player

            createOrUpdatePlayer(event);
            break;
        case 'DeletePlayerEvent':
            createOrUpdatePlayer(event, true);
            break;
    }
}
function getMessages() {
    return ['CreatePlayerEvent', 'DeletePlayerEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: handleMessage,
    getMessages: getMessages
};
