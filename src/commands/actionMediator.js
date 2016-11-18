var fs = require('fs');
var path = require('path');
var q = require('q');
var dbUtil = require('../db/dbUtil');

var mappings = [];

function init(log) {
    // find all the actions
    fs.readdir(__dirname + '/actioners', function (err, filenames) {
        if (err) {
            log.error(err);
        } else {
            filenames.forEach(function (filename) {
                if (filename.indexOf('Test') === -1) {
                    mappings.push({
                        code: path.basename(filename).slice(0, filename.length - 11),
                        path: path.join('actioners', filename)
                    });
                }
            });
        }
    })
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
    var ret = q.defer();

    var matchingActioner = mappings.find(function (item) {
        return item.code === command.code;
    });

    if (matchingActioner !== undefined) {
        var verifier = require('../verifiers/' + matchingActioner.code + 'Verifier');

        var errors = verifier(command); //todo: maybe this should return promise as well

        if (errors.length === 0) {
            log.info('Dispatching ' + command.code);

            // find the actioner
            var resp;
            var invoker = require('./' + matchingActioner.path);

            // actually action the command
            invoker.action(command, log)
                .then(function (success) {
                    log.info('Dispatched ' + command.code);
                    resp = success;
                    return saveCommand(command, log);
                })
                .then(function () {
                    // send back the response as everything has worked
                    ret.resolve(resp);
                })
                .catch(function (err) {
                    console.log('error in action mediator');
                    log.error(err);
                    ret.reject(err);
                })

        } else {
            log.error(...errors);
            ret.reject(errors);
        }

    } else {
        ret.reject(['Couldn\'t find actioner']);
    }

    return ret.promise;
}


module.exports = {
    init: init,
    dispatch: dispatch
};
