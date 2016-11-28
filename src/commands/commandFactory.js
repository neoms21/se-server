const Rx = require('rx');

function start(command) {

    // find the command handler
    let invoker = require('./' + matchingActioner.path);

    return Rx.Observable.start(invoker, { command: command }); // context will be bound to this of invoker
}

module.exports = {
    start: start
};