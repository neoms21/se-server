const sinon = require('sinon');
const chai = require('chai');
const mongoRepository = require('../db/mongo-repository');
const deNormalizer = require('./logins-denormalizer');
const Rx = require('rxjs/Rx');
const eventMediator = require('../cqrs/event-mediator');
const generalServices = require('../cqrs/general-services');

describe('Login denormalizers', function () {
    let countStub;
    let count = 0;
    let timeStub;
    let loggerStub;
    let dispatchStub;
    let insertStub;

    beforeEach(function () {
        countStub = sinon.stub(mongoRepository, 'getCount', function () {
            // supply dummy observable
            return Rx.Observable.of(0);
        });
        insertStub = sinon.stub(mongoRepository, 'insert', function () {
            // supply dummy observable
            return Rx.Observable.of('');
        });
        timeStub = sinon.stub(generalServices, 'getTime', () => new Date('01 Sep 2016 08:00'));
        loggerStub = {
            info: function () {
            }
        };

        eventMediator.init(loggerStub);
        dispatchStub = sinon.stub(eventMediator, 'dispatch', function () {
        });

    });

    afterEach(function () {
        countStub.restore();
        timeStub.restore();
        dispatchStub.restore();
        insertStub.restore();
    });

    describe('handleRegisterUser', function () {

        it('should check the count', function (done) {
            deNormalizer.handleMessage({id: 1, command: {payload: {}}});
            chai.assert.isTrue(countStub.called);
            done();
        });
    });

    describe('getMessages', function () {

        it('should return correct messages', function () {

            const msgList = deNormalizer.getMessages();
            chai.assert.isArray(msgList, 'Should be array');
            chai.assert.equal(msgList.length, 1);
            chai.assert.equal(msgList[0], 'UserRegisteredEvent');
        });

    });
});
