const fs = require('fs');
const path = require('path');
const q = require('q');
const dbUtil = require('../db/dbUtil');
const Rx = require('rx');

let mappings = [];

function init(log) {
    console.log('command mediator init');

    // find all the actions
    fs.readdir(__dirname + '/handlers', function (err, filenames) {
        if (err) {
            log.error(err);
        } else {
            filenames.forEach(function (filename) {
                if (filename.indexOf('Test') === -1) { // it is real command handler
                    mappings.push({
                        code: path.basename(filename).slice(0, filename.length - 10),
                        path: path.join('handlers', filename)
                    });
                }
            });
        }
    });
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

function dispatch(command, log) {
    let ret = {status: 200, message: ''};

    let matchingActioner = mappings.find(function (item) {
        return item.code === command.code;
    });

    if (matchingActioner !== undefined) {
        var verifier = require('./verifiers/' + matchingActioner.code + 'Verifier');
        var errors = verifier(command); //todo: maybe this should return promise as well

        if (errors.length === 0) {
            log.info('Dispatching ' + command.code);

            // find the actioner
            let invoker = require('./' + matchingActioner.path);
            // to send messages back
            let responder = new Rx.Subject();

            // actually action the command
            Rx.Observable.start(invoker, { command: command, log: log })
                .subscribe(resp => {

                }, err => {

                }, () => {
                    // finished so send end response
                    saveCommand(command, log);
                });

            // tell client we have executed command
            ret.message = 'Command ${command.code} being executed';
        } else {
            ret.status = 501;
            console.log(errors);
            ret.message = errors.toString();
        }

    } else {
        ret.message = 'Couldn\'t find command';
        ret.status = 501;
    }

    log.info(ret);

    return ret;
}


module.exports = {
    init: init,
    dispatch: dispatch
};
