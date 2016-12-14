const Rx = require('rx');

function start(commandPath, command) {

    // find the command handler
    let invoker = require('./' + commandPath);

    return Rx.Observable.start(invoker, { command: command }); // context will be bound to this of invoker
}

module.exports = {
    start: start
};