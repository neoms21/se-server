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

    beforeEach(function () {
        countStub = sinon.stub(mongoRepository, 'getCount', function () {
            // supply dummy observable
            return Rx.Observable.from([count]);
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
    });

    describe('handleRegisterUser', function () {
        it('should check response is array', function (done) {
            handler.command = {};
            handler.verify().toArray()
                .subscribe(function (success) {
                    assert(typeof success, 'array');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check squad, matchdate and opposition name are defined', function (done) {
            handler.command = {};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 3);
                    assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
                    assert.deepEqual(resp[1], {matchDate: 'Match date property was not defined'});
                    assert.deepEqual(resp[2], {opposition: 'Opposition property was not defined'});
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check matchdate and opposition not defined when squad is defined', function (done) {
            handler.command = {squad: 1};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.deepEqual(resp[0], {name: 'MatchDate property was not defined'});
                    assert.deepEqual(resp[1], {email: 'Opposition property was not defined'});
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check squad, opposition not defined when matchdate is defined', function (done) {
            handler.command = {matchDate: new Date()};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
                    assert.deepEqual(resp[1], {opposition: 'Opposition property was not defined'});
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check squad, matchDate not defined when opposition is defined', function (done) {
            handler.command = {opposition: 'Corinthian casuals'};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.deepEqual(resp[0], {squad: 'Squad property was not defined'});
                    assert.deepEqual(resp[1], {matchDate: 'MatchDate property was not defined'});
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

    });

    describe('getMessages', function () {

        it('should return correct messages', function () {

            const msgList = deNormalizer.getMessages();
            chai.assert.isArray(msgList, "Should be array");
            chai.assert.equal(msgList.length, 1);
            chai.assert.equal(msgList[0], 'UserRegisteredEvent');
        });

    });
});
