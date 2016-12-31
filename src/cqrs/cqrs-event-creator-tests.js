var assert = require('assert');
var cqrsEventCreator = require('./cqrs-event-creator');
var commandVerifier = require('./commandVerifier');
var sinon = require('sinon');

describe('CQRS Event creator', function () {
    var verifierStub;
    var command = {correlationId: 1, commandName: 'AddUser'};

    before(function () {
        verifierStub = sinon.stub(commandVerifier, 'verify');
    });
    after(function () {
        verifierStub.restore();
    });

    describe('commandExecutedEvent', function () {
        it('should give error if command verifier gives error', function () {
            verifierStub.returns(['correlationId']);
            var results = cqrsEventCreator.CommandExecuted(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, false);
            assert.equal(results.message, 'Command has undefined properties correlationId');
        });
        it('should create event if command verifier gives no error', function () {
            verifierStub.returns([]);
            var results = cqrsEventCreator.CommandExecuted(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, true);
            assert.ok(results.event.eventName !== undefined);
            assert.ok(results.event.correlationId !== undefined);
            assert.equal(results.event.eventName, 'CommandExecutedEvent');
            assert.equal(results.event.correlationId, 1);
        });
    });

    describe('commandVerificationFailedEvent', function () {
        it('should give error if command verifier gives error', function () {
            verifierStub.returns(['correlationId']);
            var results = cqrsEventCreator.CommandVerificationFailed(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, false);
            assert.equal(results.message, 'Command has undefined properties correlationId');
        });
        it('should create event if command verifier gives no error', function () {
            verifierStub.returns([]);
            var results = cqrsEventCreator.CommandVerificationFailed(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, true);
            assert.ok(results.event.eventName !== undefined);
            assert.ok(results.event.correlationId !== undefined);
            assert.ok(results.event.messages !== undefined);
            assert.equal(results.event.eventName, 'CommandVerificationFailedEvent');
            assert.equal(results.event.correlationId, 1);
        });
    });

    describe('commandSaveCommandErrorEvent', function () {
        it('should give error if command verifier gives error', function () {
            verifierStub.returns(['className']);
            var results = cqrsEventCreator.SaveCommandError(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, false);
            assert.equal(results.message, 'Command has undefined properties className');
        });
        it('should create event if command verifier gives no error', function () {
            verifierStub.returns([]);
            var results = cqrsEventCreator.SaveCommandError(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, true);
            assert.ok(results.event.eventName !== undefined);
            assert.ok(results.event.correlationId !== undefined);
            assert.ok(results.event.error !== undefined);
            assert.equal(results.event.eventName, 'SaveCommandErrorEvent');
            assert.equal(results.event.correlationId, 1);
        });
    });

    describe('commandSavedEvent', function () {
        it('should give error if command verifier gives error', function () {
            verifierStub.returns(['className']);
            var results = cqrsEventCreator.CommandSaved(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, false);
            assert.equal(results.message, 'Command has undefined properties className');
        });
        it('should create event if command verifier gives no error', function () {
            verifierStub.returns([]);
            var results = cqrsEventCreator.CommandSaved(command);

            assert(verifierStub.called);
            assert.equal(results.wasSuccessful, true);
            assert.ok(results.event.eventName !== undefined);
            assert.ok(results.event.correlationId !== undefined);
            assert.equal(results.event.eventName, 'CommandSavedEvent');
            assert.equal(results.event.correlationId, 1);
        });
    });
});
