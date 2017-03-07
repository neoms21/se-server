var util = require('util');

const Rx = require('rxjs/Rx');
var queryVerifier = function (query) {

    var errors = [];

    if (util.isNullOrUndefined(query)) {
        errors.push('query was not defined');
    } else {
        if (util.isNullOrUndefined(query.properties)) {
            errors.push('query properties was not defined');
        }

        if (util.isNullOrUndefined(query.properties.queryName)) {
            errors.push('query needs its queryName');
        }

        if (util.isNullOrUndefined(query.properties.correlationId) || query.properties.correlationId === '') {
            errors.push('query needs its correlationId');
        }

    }

    return Rx.Observable.of(errors);
};

module.exports.verify = queryVerifier;
