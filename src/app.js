const restify = require('restify');
const logger = require('bunyan');
const uuid = require('uuid');
const socketio = require('socket.io');
const commandRoutes = require('./routes/commandRoutes');
const dbUtil = require('./db/dbUtil');
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

io.set('transports', [ 'websocket' ]);
// add middleware
//server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

// log requests
server.pre(function (request, response, next) {
    // response.header("Access-Control-Allow-Origin", "*");
    // response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    log.info({req: JSON.stringify(request.body)}, 'REQUEST' + JSON.stringify(request));
    // add correlation id
    response.header('correlation', uuid.v4());
    next();
});

// socket io
io.on('connection', function (socket) {
    console.log('client connected '+ new Date())
    socket.emit('news', {hello: 'world'});
    socket.on('my other event', function (data) {
        console.log(data);
    });

    socket.on('command', function (req) {
        console.log(req);

    });
});


// actions need init
commandMediator.init(log);

//check db
dbUtil.createOrOpenDb();
log.info("Collections checked (and maybe created)");

//server.bodyParser();

// add routes
commandRoutes(server);

server.listen(8180, function () {
    console.log('%s listening at %s', server.name, server.url);
});


