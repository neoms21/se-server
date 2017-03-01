'use strict';
const MongoRepository = require('../db/mongo-repository');
const GeneralServices = require('../cqrs/general-services');

let logger;

function init(log) {
    logger = log;
}

function fetchSquads(event) {

    let items = [];
    // GeneralServices.applyCommonFields(squad, event);
    MongoRepository.query('squads', {})
        .subscribe(function (x) {
            items.push(x);
        }, function (err) {

        }, function () {

        });
}

function getMessages() {
    return ['FetchSquadsEvent'];
}

//noinspection JSUnresolvedVariable
module.exports = {
    init: init,
    handleMessage: fetchSquads,
    getMessages: getMessages
};
