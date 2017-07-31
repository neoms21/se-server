const sinon = require('sinon');
const chai = require('chai');
const mongoRepository = require('../db/mongo-repository');
const Rx = require('rxjs/Rx');
const EventMediator = require('../cqrs/event-mediator');
const GeneralServices = require('../cqrs/general-services');
const deNormalizer = require('./logins-denormalizer');

describe('Login denormalizers', function () {
  let countStub;
  let insertStub;
  let count = 0;
  let commonStub;
  let loggerStub;
  let dispatchStub;

    beforeEach(function () {
        countStub = sinon.stub(mongoRepository, 'getCount').returns(Rx.Observable.of(0));
        insertStub = sinon.stub(mongoRepository, 'insert').returns(Rx.Observable.of(''));
        commonStub = sinon.stub(GeneralServices, 'applyCommonFields');
        loggerStub = {
            info: sinon.stub(), error: sinon.stub()
        };

        deNormalizer.init(loggerStub);
        EventMediator.init(loggerStub);
        dispatchStub = sinon.stub(EventMediator, 'dispatch');
    });

  afterEach(function () {
    countStub.restore();
    commonStub.restore();
    dispatchStub.restore();
    insertStub.restore();
  });

  describe('handleRegisterUser', function () {
    let event = {
      command: {payload: {}}
    };

    it('should check the count', function (done) {
      deNormalizer.handleMessage({id: 1, command: {payload: {}}});
      chai.assert.isTrue(countStub.called);
      done();
    });

    it('should give error when event properties not set', function (done) {
      deNormalizer.handleMessage({});
      chai.assert.isTrue(loggerStub.error.called);
      done();
    });

    it('should give error when event properties not set', function (done) {
      deNormalizer.handleMessage(event);
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
})
;
