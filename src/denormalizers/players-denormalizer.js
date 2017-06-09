'use strict';
const MongoRepository = require('../db/mongo-repository');
const ObjectId = require('mongodb').ObjectId;
let logger;

function init(log) {
    logger = log;
}

function createPlayer(event) {


    MongoRepository.query('squads', {_id: new ObjectId(event.command.player.squadId)})
        .subscribe(squad => {

            if (!squad.players) {
                squad.players = [];
            }

            squad.players.push(event.command.player);
            squad._id = new ObjectId(squad._id);

            MongoRepository.update('squads', squad, '_id', ['players']);
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
