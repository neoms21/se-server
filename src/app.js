var restify = require('restify');
var logger = require('bunyan');
var uuid = require('uuid');
var commandRoutes = require('./routes/commandRoutes');
var createOrOpenDb = require('./db/createOrOpenDb');
var actionMediator = require('./actioning/actionMediator');

// create our logger
var log = new logger.createLogger({
    name: 'Sports Editor',
    serializers: {
        req: logger.stdSerializers.req
    }
});

server = restify.createServer({
    name: 'Sports Editor',
    version: '0.1.0',
    log: log
});

// add middleware
//server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// log requests
server.pre(function (request, response, next) {
    log.info({req: JSON.stringify(request.body)}, 'REQUEST');
    // add correlation id
    response.header('correlation', uuid.v4());
    next();
});

// actions need init
actionMediator.init(log);

//check db
createOrOpenDb(log);

//server.bodyParser();

// add routes
commandRoutes(server);

server.listen(8180, function () {
    console.log('%s listening at %s', server.name, server.url);
});


