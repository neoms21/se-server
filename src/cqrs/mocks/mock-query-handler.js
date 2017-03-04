'use strict';
const Rx = require('rxjs');

/* this is used by tests

 */

var verify = function () {

};

var execute = function () {
    return Rx.Observable.of(['test']);
};

module.exports = {
    verify: verify,
    execute: execute,
    getQuery: () => "DummyQuery"
};
