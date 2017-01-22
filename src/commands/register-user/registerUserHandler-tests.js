const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./RegisterUserCommandHandler');
const Rx = require('rxjs/Rx');
const eventMediator = require('../../cqrs/event-mediator');
const generalServices = require('../../cqrs/general-services');

describe('Register user command', function () {
    let countStub;
    let count = 0;
    let timeStub;

    beforeEach(function () {
        countStub = sinon.stub(mongoRepository, 'getCount', function () {
            // supply dummy observable
            return Rx.Observable.from([count]);
        });
        timeStub = sinon.stub(generalServices, 'getTime', () => Date.parse('01 Sep 2016 08:00'));
    });

    afterEach(function () {
        countStub.restore();
        timeStub.restore();
    });

    describe('Verify', function () {
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

        it('should check name, userName and password is defined', function (done) {
            handler.command = {};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 3);
                    assert.equal(resp[0].message, 'Name property was not defined');
                    assert.equal(resp[1].message, 'Email property was not defined');
                    assert.equal(resp[2].message, 'Password property was not defined');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });

        });

        it('should check name, userName not defined when password is defined', function (done) {
            handler.command = {password: 'ghghghgh'};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.equal(resp[0].message, 'Name property was not defined');
                    assert.equal(resp[1].message, 'Email property was not defined');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check password, userName not defined when name is defined', function (done) {
            handler.command = {name: 'ghghghgh'};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.equal(resp[0].message, 'Email property was not defined');
                    assert.equal(resp[1].message, 'Password property was not defined');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

        it('should check password, name not defined when username is defined', function (done) {
            handler.command = {email: 'ghg@hhhh.com'};
            handler.verify().toArray()
                .subscribe(function (resp) {
                    assert.equal(resp.length, 2);
                    assert.equal(resp[0].message, 'Name property was not defined');
                    assert.equal(resp[1].message, 'Password property was not defined');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });

    });

    describe('Execute', function () {
        let loggerStub;
        let dispatchStub;

        beforeEach(function () {
            loggerStub = {
                info: function () {
                }
            };
            eventMediator.init(loggerStub);
        });

        afterEach(function () {
            dispatchStub.restore();
        });

        it('should raise UserRegisteredEvent', function () {
            dispatchStub = sinon.stub(eventMediator, 'dispatch', function () {
            });

            handler.command = {email: 'mark', name: 'mark s', correlationId: 1};
            handler.execute();

            assert(dispatchStub.called);
            assert(dispatchStub.calledWith({ correlationId: 1,
                eventName: 'UserRegisteredEvent',
                isFailure: false,
                created: Date.parse('01 Sep 2016 08:00'),
                createdBy: undefined,
                messageNumber: 1,
                messageCount: 1,
                email: 'mark',
                name: 'mark s' }
            ));
        });

    });
});
