var commandVerifier = require('../verifiers/commandVerifier');
var actionMediator = require('./actionMediator');

var commandRoutes = function (server) {

    server.post('command', (req, res, next) => {

        // get param
        var command = req.body.command;
        // check command basics
        var errs = commandVerifier(command);

        if (errs.length === 0) {

            // add extra info
            command.correlationId = res.header('correlation');
            command.when = new Date(req.time());

            // go send it
            actionMediator.dispatch(command, req.log)
                .then(function (success) {
                    res.send(200, {response: success});
                })
                .catch(function (err) {
                    res.send(401, {response: err.join(',')});
                });

        } else {
            req.log.error(...errs);
            res.send(400, ...errs);
        }

        next();
    });
};

module.exports = commandRoutes;
