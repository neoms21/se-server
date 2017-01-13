'use strict';
var path = require('path');
var Rx = require('rxjs');
var Filehound = require('filehound');

var mappings;
var logger;
var propagator = new Rx.Subject();
var exports;

function init(log) {
    logger = log;

    // set up which messages go to which components
    mappings = []; // make sure it's clear

    log.info('denormalizer ' + process.cwd() + '/src/denormalizers');
    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/denormalizers')
        //.match('!(*-test*)*')
        .find(function (err, filenames) {
            if (err) {
                logger.error("error finding denormalizers ", err);
            } else {
                filenames.forEach(function (filename) {

                    // instantiate so we can get messages
                    var instance = require(filename);
                    console.log('****' + JSON.stringify(instance))
                    if (instance !== undefined && instance.hasOwnProperty('getMessageMap')) {
                        mappings.concat(instance.getMessageMap());
                    }
                });

                mappings.forEach(function (mp) {
                    log.info('Added denormalizer for message ' + mp.message);
                });
            }
        });
}

exports = {
    init: init
};

module.exports = exports;