var assert = require('assert');
var cqrsEventCreator = require('./cqrs-event-creator');
var commandVerifier = require('./commandVerifier');
var sinon = require('sinon');

describe('CQRS Event eventFactory', function () {
    var command = {correlationId: 1, commandName: 'AddUser', userId: 222};

    describe('commandExecuted', function () {
        it('should return event', function () {
            //verifierStub.returns(['correlationId']);
            var results = cqrsEventCreator.CommandExecuted(command);

            //assert(verifierStub.called);
            assert.equal(results.command.correlationId, 1);
            assert.equal(results.properties.eventName, 'CommandExecutedEvent');
            assert.equal(results.properties.isFailure, false);
            assert.equal(results.properties.createdBy, 222);
            assert.notEqual(results.properties.created, null);
        });
    });

    describe('commandVerificationFailed', function () {
        it('should return event', function () {
            var results = cqrsEventCreator.CommandVerificationFailed(command);

            assert.equal(results.command.correlationId, 1);
            assert.equal(results.properties.eventName, 'CommandVerificationFailedEvent');
            assert.equal(results.properties.isFailure, true);
            assert.equal(results.properties.createdBy, 222);
            assert.ok(results.messages);
            assert.notEqual(results.properties.created, null);
        });
    });

    describe('commandSaveCommandErrorEvent', function () {
        it('should give error if command verifier gives error', function () {
            var results = cqrsEventCreator.SaveCommandError(command);

            assert.equal(results.command.correlationId, 1);
            assert.equal(results.properties.eventName, 'SaveCommandErrorEvent');
            assert.equal(results.properties.isFailure, true);
            assert.equal(results.properties.createdBy, 222);
            assert.notEqual(results.properties.created, null);
        });

    });

    describe('commandSaved', function () {
        it('should give error if command verifier gives error', function () {
            var results = cqrsEventCreator.CommandSaved(command);

            assert.equal(results.command.correlationId, 1);
            assert.equal(results.properties.eventName, 'CommandSavedEvent');
            assert.equal(results.properties.isFailure, true);
            assert.equal(results.properties.createdBy, 222);
            assert.notEqual(results.properties.created, null);
        });
    });
});
