'use strict';
const assert = require('assert');
const sinon = require('sinon');
const EventFactory = require('./event-factory');
const CommandFactory = require('./command-factory');


describe('Event Factory', () => {
    describe('create', () => {
        it('should fill in fields other than command', () => {
            const result = EventFactory.createFromNone('MyEvent', false);

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.equal(result.properties.isFailure, false);
        });

        it('should give error when no name', () => {
            assert.throws(EventFactory.createFromNone,
                /Name needs to be specified/);
        });

        it('should fill in isfailure when not supplied', () => {
            const result = EventFactory.createFromNone('MyEvent');

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.equal(result.properties.isFailure, false);
        });

        it('should fill in command', () => {
            const cmd = CommandFactory.create('cmd1', 20, 30, new Date('31-dec-2012'));
            const result = EventFactory.createFromCommand(cmd, 'MyEvent', false);

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.ok(result.command);
            assert.equal(result.command.name, 'cmd1');
            assert.equal(result.command.correlationId, 20);
        });

    });

    describe('CQRS Event EventFactory', function () {
        const command = CommandFactory.create('AddUser', 1, 222);

        describe('commandExecuted', function () {
            it('should return event', function () {
                //verifierStub.returns(['correlationId']);
                var results = EventFactory.CommandExecuted(command);

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
                var results = EventFactory.CommandVerificationFailed(command);

                assert.equal(results.command.correlationId, 1);
                assert.equal(results.properties.eventName, 'CommandVerificationFailedEvent');
                assert.equal(results.properties.isFailure, true);
                assert.equal(results.properties.createdBy, 222);
                assert.ok(results.errors);
                assert.notEqual(results.properties.created, null);
            });
        });

        describe('commandSaveCommandErrorEvent', function () {
            it('should give error if command verifier gives error', function () {
                var results = EventFactory.SaveCommandError(command);

                assert.equal(results.command.correlationId, 1);
                assert.equal(results.properties.eventName, 'SaveCommandErrorEvent');
                assert.equal(results.properties.isFailure, true);
                assert.equal(results.properties.createdBy, 222);
                assert.notEqual(results.properties.created, null);
            });

        });

        describe('commandSaved', function () {
            it('should give error if command verifier gives error', function () {
                var results = EventFactory.CommandSaved(command);

                assert.equal(results.command.correlationId, 1);
                assert.equal(results.properties.eventName, 'CommandSavedEvent');
                assert.equal(results.properties.isFailure, true);
                assert.equal(results.properties.createdBy, 222);
                assert.notEqual(results.properties.created, null);
            });
        });
    });
});