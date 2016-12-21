
//let commandRoutes = function (server: any) {

    // server.post('command', (req, res, next) => {
    //
    //     // get param
    //     var command = req.body;
    //     // check command basics
    //     var errs = commandVerifier(command);
    //
    //     if (errs.length === 0) {
    //
    //         // add extra info
    //         command.correlationId = res.header('correlation');
    //         command.when = new Date(req.time());
    //
    //         // go send it
    //         var result = actionMediator.dispatch(command, req.log);
    //         res.send(result.code, {response: result.message});
    //
    //     } else {
    //         req.log.error(...errs);
    //         res.send(400, ...errs);
    //     }
    //
    //     next();
    // });
//};

//module.exports = commandRoutes;
