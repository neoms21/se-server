const fs = require('fs');
const path = require('path');
const q = require('q');
const dbUtil = require('../db/dbUtil');

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
                        code: path.basename(filename).slice(0, filename.length - 11),
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

    console.log(matchingActioner);

    if (matchingActioner !== undefined) {
        var verifier = require('./verifiers/' + matchingActioner.code + 'Verifier');
        var errors = verifier(command); //todo: maybe this should return promise as well

        if (errors.length === 0) {
            log.info('Dispatching ' + command.code);

            // find the actioner
            let invoker = require('./' + matchingActioner.path);

            // actually action the command
            Rx.Observable.start(invoker, { command: command, log: log });
            ret.message = 'Command ${command.code} being executed';
            //invoker.action(command, log);

            // .then(function (success) {
            //     log.info('Dispatched ' + command.code);
            //     resp = success;
            //     return saveCommand(command, log);
            // })
            // .then(function () {
            //     // send back the response as everything has worked
            //     ret.resolve(resp);
            // })
            // .catch(function (err) {
            //     console.log('error in action mediator');
            //     log.error(err);
            //     ret.reject(err);
            // })

        } else {
            ret.status = 501;
            console.log(errors);
            ret.message = errors.toString();
        }

    } else {
        ret.message = 'Couldn\'t find actioner';
        ret.status = 501;
    }

    log.info(ret);

    return ret;
}


module.exports = {
    init: init,
    dispatch: dispatch
};
