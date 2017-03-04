
'use strict';
const QueryMediator = require('./query-mediator');
const assert = require('assert');
const sinon = require('sinon');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const eventFactory = require('./event-factory');
const eventMediator = require('./event-mediator');
const QueryFactory = require('./query-factory');

let logStub = {
    info: function () {
    },
    error: function () {
    }
};
let fhStub = {
    ext: function () {
    },
    paths: function () {
    },
    match: function () {
    },
    find: function () {
    },
    not: function () {
    }
};

let createErrorEvent = function (query, message) {
    return {
        eventName: 'queryVerificationFailedEvent',
        correlationId: query.correlationId,
        messageNumber: 1,
        messageCount: 1,
        messages: message,
        created: new Date(),
        createdBy: undefined,
        isFailure: true
    };
};

describe('Query factory', function () {
    let logMock;
    let fhMock;
    let createStub;
    let mongoMock;
    let cqrsEventMock;
    let eventMock;

    beforeEach(function () {
        logMock = sinon.mock(logStub);
        createStub = sinon.stub(Filehound, 'create').returns(fhStub);
        fhMock = sinon.mock(fhStub);
        fhMock.expects('ext').withArgs('js').returns(fhStub);
        fhMock.expects('paths').withArgs(process.cwd() + '/src/queries').returns(fhStub);
        fhMock.expects('match').withArgs('*-tests*').returns(fhStub);
        fhMock.expects('not').returns(fhStub);

        mongoMock = sinon.mock(mongoRepository);
        cqrsEventMock = sinon.mock(eventFactory);
        eventMock = sinon.mock(eventMediator);
    });

    afterEach(function () {
        fhMock.verify();
        logMock.verify();
        mongoMock.verify();
        cqrsEventMock.verify();
        fhMock.verify();
        eventMock.verify();

        fhMock.restore();
        createStub.restore();
        logMock.restore();
        mongoMock.restore();
        cqrsEventMock.restore();
        fhMock.restore();
        eventMock.restore();
    });

    describe('createQuery', function () {

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['./mocks/mock-query-handler.js',
                './mocks/mock-query-handler.js', './mocks/mock-query-handler.js']);

            QueryMediator.init(logStub);
        });

        afterEach(function () {
            //fhMock.verify();
        });

        it('should create the query with supplied info', function () {
            let request = {properties: {queryName: 'SaveUser'}, payload: {id: 1, name: 'john'}};
            let query = QueryFactory.createQuery(request);

            assert.notEqual(query, null);
            assert.notEqual(query, undefined);
            assert.equal(query.properties.queryName, 'SaveUser');
            assert.equal(query.id, 1);
            assert.equal(query.name, 'john');
        });

        it('should create the query with supplied info, but no payload', function () {
            let request = {properties: {queryName: 'SaveUser'}};
            let query = QueryFactory.createQuery(request);

            assert.notEqual(query, null);
            assert.notEqual(query, undefined);
            assert.equal(query.properties.queryName, 'SaveUser');
            assert.equal(query.id, undefined);
            assert.equal(query.name, undefined);
        });

        it('shouldnt create the query without supplied query name', function () {
            let request = {queryNameXXX: 'SaveUser'};
            let query = QueryFactory.createQuery(request);

            assert.equal(query, undefined);
        });
    });

});


