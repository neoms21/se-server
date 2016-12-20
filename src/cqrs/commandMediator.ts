const fs = require('fs');
const path = require('path');
const q = require('q');
const dbUtil = require('../db/repository');
const Rx = require('rx');
const CommandExecuting = require('./../commands/models/command-executing');
const CommandExecuted = require('./../commands/models/command-executed');
const CommandMediatorInitiating = require('./../commands/models/command-mediator-initiated');
const CommandFactory = require('./commandFactory');

let mappings = [];
let propagator = new Rx.Subject();

function init() {

    // find all the actions
    fs.readdir(__dirname + '/handlers', function (err, filenames) {
        if (err) {
            propagator.onError(err);
        } else {
            filenames.forEach(function (filename) {
                if (filename.indexOf('Test') === -1) { // it is real command handler
                    let mapping = {
                        code: path.basename(filename).slice(0, filename.length - 10),
                        path: path.join('handlers', filename)
                    };
                    mappings.push(mapping);
                }
            });
            propagator.onNext(new CommandMediatorInitiating(mappings.length));
        }
    });

}

function getObservable() {
    return propagator;
}

function saveCommand(command, log) {
    var ret = q.defer();
    dbUtil(log)
        .then(function (db) {
            db.collection('commands').insertOne(command, function (err, result) {
                if (err === null) {
                    ret.resolve(result);
                } else {
                    ret.reject(err);
                }
            })
        })
        .catch(function (err) {
            ret.reject(err);
        });

    return ret.promise;
}

function dispatch(command) {
    let ret = {status: 200, message: ''};

    let matchingHandler = mappings.find(function (item) {
        return item.code === command.code;
    });

    if (matchingHandler !== undefined) {
        const verifier = require('./common/' + matchingHandler.code + 'Verifier');
        let errors = verifier(command);

        if (errors.length === 0) {
            let msg = new CommandExecuting(command.correlationId);
            propagator.onNext(msg);

            // actually action the command
            CommandFactory.start(matchingHandler.path, command)
                .subscribe(resp => {
                    // put it on
                    propagator.onNext(resp);
                }, err => {
                    propagator.onError(err);
                }, () => {
                    // finished so send end response
                    let msg = new CommandExecuted(command.correlationId);
                    propagator.onNext(msg);
                    saveCommand(command);
                });

            // tell client we have executed command
            ret.message = `Command ${command.code} being executed`;
        } else {
            ret.status = 501;
            ret.message = errors.toString();
        }

    } else {
        ret.message = "Couldn't find " + command.code + " command";
        ret.status = 501;
    }

    return ret;
}


module.exports = {
    init: init,
    dispatch: dispatch,
    getObservable: getObservable
};
