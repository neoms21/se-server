var assert = require('assert');
var mongoRepository = require('../db/mongo-repository');
var sinon = require('sinon');
var eventMediator = require('./event-mediator');

describe('Event mediator', function () {
    var mongoStub;
    var loggerStub;
    var loggerInfoStub;

    before(function () {
        mongoStub = sinon.stub(mongoRepository, 'insert');
        // create logger, add info method and then stub that
        loggerStub = sinon.stub();
        loggerStub.info = Function;
        loggerStub.debug = Function;
        loggerInfoStub = sinon.stub(loggerStub, 'info');
        sinon.stub(loggerStub, 'debug');
        // initialise our testee with ur stub
        eventMediator.init(loggerStub);
    });
    after(function () {
        mongoStub.restore();
        loggerInfoStub.restore();
    });

    describe('dispatch', function () {
        it('should give error if event properties not set', function () {
            assert.throws(function () {
                    eventMediator.dispatch({});
                },
                function (err) {
                    if ((err instanceof Error) && err.message === 'Event dispatched without properties - {}') {
                        return true;
                    }
                });
        });

        it('should give error if event name not set', function () {
            assert.throws(function () {
                    eventMediator.dispatch({properties: {}});
                },
                function (err) {
                    if ((err instanceof Error) && err.message === 'Event dispatched without name - {"properties":{}}') {
                        return true;
                    }
                });
        });

        it('should save to repository', function () {
            const event = {properties: { eventName: 'BongoEvent'}};
            eventMediator.dispatch(event);

            assert(loggerInfoStub.calledWith('Dispatching event BongoEvent'));
            assert(mongoStub.calledWith('events', event));
        });

        it('should publish & log', function (done) {

            eventMediator.propagator.subscribe(function (success) {
                assert(success === event);
                done();
            }, function (err) {
                // shouldnt get here
                assert.ifError(err);
                done();
            });

            const event = {properties: { eventName: 'Bongo2Event'}};
            eventMediator.dispatch(event);

            assert(loggerInfoStub.calledWith('Event Bongo2Event dispatched'));
        });

    });
});
