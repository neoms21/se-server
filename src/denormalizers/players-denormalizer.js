'use strict';
const MongoRepository = require('../db/mongo-repository');
const ObjectId = require('mongodb').ObjectId;
let logger;

const GeneralServices = require('../cqrs/general-services');

const Guid = require('uuid');

function init(log) {
    logger = log;
}

function createPlayer(event) {

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
            squad.players.push(event.command.player);
            MongoRepository.update('squads', event.command.player.squadId, {
                players: squad.players, "properties.modified": new Date()
            });
        });
}
function getMessages() {
    return ['CreatePlayerEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: createPlayer,
    getMessages: getMessages
};
