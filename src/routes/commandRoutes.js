var commandVerifier = require('../commands/verifiers/commandVerifier');
var actionMediator = require('../commands/commandMediator');

var commandRoutes = function (server) {

    server.post('command', (req, res, next) => {

        // get param
        var command = req.body;
        // check command basics
        var errs = commandVerifier(command);

        if (errs.length === 0) {

            // add extra info
            command.correlationId = res.header('correlation');
            command.when = new Date(req.time());

            // go send it
            var result = actionMediator.dispatch(command, req.log);
            res.send(result.code, {response: result.message });

                // .then(function (success) {
                //     res.send(200, {response: success});
                // })
                // .catch(function (err) {
                //     res.send(401, {response: err.join(',')});
                // });

        } else {
            req.log.error(...errs);
            res.send(400, ...errs);
        }

        next();
    });
};

module.exports = commandRoutes;
