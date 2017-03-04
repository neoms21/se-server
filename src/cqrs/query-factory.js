'use strict';
const Util = require('util');

function createQuery(request, clientId) {
    let instance;

    // needs command name
    if (!Util.isNullOrUndefined(request.properties)) {

        // create it now
        instance = {
            properties: {
                queryName: request.properties.queryName,
                correlationId: request.properties.correlationId,
                clientId: clientId
            }
        };

        // add extra props
        Object.assign(instance, request.payload);
    }

    return instance;
}

const create = (name, userId, timeOfDay, correlationId) => {
    let instance = {
        properties: {
            queryName: name,
            createdBy: userId || 'unknown',
            created: timeOfDay || new Date(),
            correlationId: correlationId
        }
    };

    return instance;
};

module.exports = {
    createQuery: createQuery,
    create: create
};
