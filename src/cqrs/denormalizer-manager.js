var path = require('path');
var Rx = require('rxjs');
var Filehound = require('filehound');


var mappings = [];
var logger;
var propagator = new Rx.Subject();
var exports;

function init(log) {
    logger = log;

    mappings = []; //

    // find all the handlers
    Filehound.create()
        .ext('js')
        .paths(process.cwd() + '/src/denormalizers')
        .match('*denormalizer')
        .find(function (err, filenames) {
            if (err) {
                logger.error("error finding denormalizers ", err);
            } else {
                filenames.forEach(function (filename) {
                    var mapping = {
                        code: path.basename(filename, '.js').slice(0, path.basename(filename, '.js').length - 14),
                        path: filename
                    };
                    mappings.push(mapping);
                    log.info('Added denormalizer ' + mapping.code);
                });
            }
        });
}

exports = {
    init: init
};

module.exports = exports;