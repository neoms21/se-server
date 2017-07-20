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
    console.log('IN DENORM', event);
    MongoRepository.query('squads', {_id: new ObjectId(event.command.player.squadId)})
        .subscribe(squad => {
            if (!squad.players) {
                squad.players = [];
            }
            if (event.command.player.id) {
                squad.players = squad.players.filter((p) => {
                    return p.id !== event.command.player.id;
                });
            } else {
                event.command.player.id = Guid.v4();
            }
            GeneralServices.applyCommonFields(event.command.player);
            if(toDelete){
                event.command.player.isDeleted = true;
            }
            squad.players.push(event.command.player);
            MongoRepository.update('squads', event.command.player.squadId, {
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
    return ['CreatePlayerEvent','DeletePlayerEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: handleMessage,
    getMessages: getMessages
};
