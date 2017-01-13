var assert = require('assert');
var cqrsEventCreator = require('./cqrs-event-creator');
var commandVerifier = require('./commandVerifier');
var sinon = require('sinon');

describe('CQRS Event eventFactory', function () {
    //var verifierStub;
    var command = {correlationId: 1, commandName: 'AddUser', userId: 222};

    before(function () {
        //verifierStub = sinon.stub(commandVerifier, 'verify');
    });
    after(function () {
        //verifierStub.restore();
    });

    describe('commandExecuted', function () {
        it('should return event', function () {
            //verifierStub.returns(['correlationId']);
            var results = cqrsEventCreator.CommandExecuted(command);

            //assert(verifierStub.called);
            assert.equal(results.correlationId, 1);
            assert.equal(results.eventName, 'CommandExecutedEvent');
            assert.equal(results.isFailure, false);
            assert.equal(results.createdBy, 222);
            assert.notEqual(results.created, null);
        });
    });

    describe('commandVerificationFailed', function () {
        it('should return event', function () {
            //verifierStub.returns(['correlationId']);
            var results = cqrsEventCreator.CommandVerificationFailed(command);

            assert.equal(results.correlationId, 1);
            assert.equal(results.eventName, 'CommandVerificationFailedEvent');
            assert.equal(results.isFailure, true);
            assert.equal(results.createdBy, 222);
            assert.ok(results.messages);
            assert.notEqual(results.created, null);
        });
    });

    describe('commandSaveCommandErrorEvent', function () {
        it('should give error if command verifier gives error', function () {
            var results = cqrsEventCreator.SaveCommandError(command);

            assert.equal(results.correlationId, 1);
            assert.equal(results.eventName, 'SaveCommandErrorEvent');
            assert.equal(results.isFailure, true);
            assert.equal(results.createdBy, 222);
            assert.notEqual(results.created, null);
        });

    });

    describe('commandSaved', function () {
        it('should give error if command verifier gives error', function () {
            //verifierStub.returns(['className']);
            var results = cqrsEventCreator.CommandSaved(command);

            assert.equal(results.correlationId, 1);
            assert.equal(results.eventName, 'CommandSavedEvent');
            assert.equal(results.isFailure, true);
            assert.equal(results.createdBy, 222);
            assert.notEqual(results.created, null);
        });
    });
});
