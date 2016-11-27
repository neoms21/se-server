const Rx = require('rx');

function start(command) {

    // find the command handler
    let invoker = require('./' + matchingActioner.path);

    return Rx.Observable.start(invoker, {command: command });
}

module.exports = {
    start: start
};