'use strict';
const QueryMediator = require('./query-mediator');
const assert = require('assert');
const sinon = require('sinon');
const Filehound = require('filehound');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const eventFactory = require('./event-factory');
const EventMediator = require('./event-mediator');
const mockHandler = require('./mocks/mock-query-handler');
const QueryFactory = require('./query-factory');
const EventFactory = require('./event-factory');

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

describe('Query mediator', function () {
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
        eventMock = sinon.mock(EventMediator);
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

    describe('init', function () {
        it('should call find on filehound with error', function () {
            fhMock.expects('find').yields('cant find');
            QueryMediator.init(logStub);
        });

        it('should call find on filehound with successful 1 file ', function () {
            fhMock.expects('find').yields(null, ['./mocks/mock-query-handler.js']);
            QueryMediator.init(logStub);
        });

        it('should call find on filehound with successful 3 files', function () {
            fhMock.expects('find').yields(null, ['./mocks/mock-query-handler.js',
                './mocks/mock-query-handler.js', './mocks/mock-query-handler.js']);
            QueryMediator.init(logStub);
        });
    });

    describe('dispatch', function () {
        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['./mocks/mock-query-handler.js',
                './mocks/mock-query-handler.js', './mocks/mock-query-handler.js']);
            QueryMediator.init(logStub);
        });

        afterEach(function () {
            fhMock.verify();
        });

        it('should give error when query doesnt match', function () {
            let query = QueryFactory.create('hhhh');
            //let event = createErrorEvent(query, 'Unable to create handler for query hhhh');

            eventMock.expects('dispatch').once(); //.withArgs(event);
            logMock.expects('error').withArgs({'@#@': 'Unable to create handler for query hhhh'});

            QueryMediator.dispatch(query);
        });

        it('should produce error event if verify fails', function () {
            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.throw('Error'));

            let query = QueryFactory.create('mock-handler');
            //logMock.expects('debug').withArgs('QueryMediator before running verify for mock-handler');
            let event = createErrorEvent(query, 'Error');
            cqrsEventMock.expects('QueryVerificationFailed').withArgs(query).returns(event);
            eventMock.expects('dispatch').once(); //withArgs(event);

            // act
            QueryMediator.dispatch(query);

            //tidy
            verifyStub.restore();
        });

        it('should produce error event if verify has error messages', function () {
            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.of('#Error'));

            let query = QueryFactory.create('mock-handler');
            let expectedEvent = createErrorEvent(query, 'Error');
            cqrsEventMock.expects('QueryVerificationFailed').withArgs(query).returns(expectedEvent);
            eventMock.expects('dispatch').withArgs(expectedEvent);

            // act
            QueryMediator.dispatch(query);

            //tidy
            verifyStub.restore();
        });

        it('should execute, save and propagate if no problems found', function () {
            let query = QueryFactory.create('DummyQuery', 1, undefined, 100);
            let expectedEvent = EventFactory.createFromQuery(query, 'LoginQueryEvent', false);
            expectedEvent.messageNumber = 1;
            expectedEvent.maxMessages = 1;
            expectedEvent.data = ['test'];

            let verifyStub = sinon.stub(mockHandler, 'verify').returns(Rx.Observable.empty());
            let executeStub = sinon.stub(mockHandler, 'execute')
                .returns(Rx.Observable.of(expectedEvent));

            eventMock.expects('dispatch').withArgs(expectedEvent);

            // act
            QueryMediator.dispatch(query);

            // check
            assert(verifyStub.called);
            assert(executeStub.called);

            //tidy
            verifyStub.restore();
            executeStub.restore();
        });
    });

});


