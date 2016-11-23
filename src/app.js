const restify = require('restify');
const logger = require('bunyan');
const uuid = require('uuid');
const socketio = require('socket.io');
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

let server = restify.createServer({
    name: 'Sports Editor',
    version: '0.0.1',
    log: log
});

// add socket.io
const io = socketio.listen(server);

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

// socket io
io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
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


