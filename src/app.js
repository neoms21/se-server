const restify = require('restify');
const logger = require('bunyan');
const uuid = require('uuid');
const commandRoutes = require('./routes/commandRoutes');
const createOrOpenDb = require('./db/createOrOpenDb');
const commandMediator = require('./commands/commandMediator');

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
    log.info({req: JSON.stringify(request.body)}, 'REQUEST' + JSON.stringify(request.body));
    // add correlation id
    response.header('correlation', uuid.v4());
    next();
});

// actions need init
commandMediator.init(log);

//check db
createOrOpenDb(log);

//server.bodyParser();

// add routes
commandRoutes(server);

server.listen(8180, function () {
    console.log('%s listening at %s', server.name, server.url);
});


