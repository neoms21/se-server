const bunyan = require('bunyan');

let logStreams = [];

const logger = () =>
    bunyan.createLogger({
        name: 'Sports Editor',
        serializers: {
            req: bunyan.stdSerializers.req
        },
        streams: logStreams.concat({
            level: 'info',
            path: './sports-editor.log'  // log INFO and above to an file
        })
    });

module.exports = {
    logger: logger
};