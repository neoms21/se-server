var sinon = require('sinon');
var assert = require('assert');
var mongoRepository = require('../../db/mongo-repository');
var handler = require('./RegisterUserCommandHandler');
var Rx = require('rxjs/Rx');
var eventMediator = require('../../cqrs/event-mediator');

describe('Register user command', function () {
    var countStub;
    var count = 0;

    beforeEach(function () {
        countStub = sinon.stub(mongoRepository, 'getCount', function () {
            // supply dummy observable
            return Rx.Observable.from([count]);
        });
    });

    afterEach(function () {
        countStub.restore();
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
                    console.log('resp' + resp.length);
                    assert.equal(resp.length, 3);
                    assert.equal(resp[0], 'RegisterUser command name property was not defined');
                    assert.equal(resp[1], 'RegisterUser command email property was not defined');
                    assert.equal(resp[2], 'RegisterUser command password property was not defined');
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
                    assert.equal(resp[0], 'RegisterUser command name property was not defined');
                    assert.equal(resp[1], 'RegisterUser command email property was not defined');
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
                    assert.equal(resp[0], 'RegisterUser command email property was not defined');
                    assert.equal(resp[1], 'RegisterUser command password property was not defined');
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
                    assert.equal(resp[0], 'RegisterUser command name property was not defined');
                    assert.equal(resp[1], 'RegisterUser command password property was not defined');
                }, function (err) {
                    assert(err, null);
                }, function () {
                    done();
                });
        });


    });

    describe('Execute', function () {
        var loggerStub;
        var dispatchStub;

        beforeEach(function () {
            loggerStub = {
                info: function () {
                }
            };
            eventMediator.init(loggerStub);
        });

        afterEach(function() {
            dispatchStub.restore();
        });

        it('should raise UserRegisteredEvent', function () {
            dispatchStub = sinon.stub(eventMediator, 'dispatch', function () {
            });

            handler.command = {email: 'mark', name: 'mark s'};
            handler.execute();

            assert(dispatchStub.called);
            assert(dispatchStub.calledWith({eventName: 'UserRegisteredEvent', email: 'mark', name: 'mark s'}));
        });

    });
});
