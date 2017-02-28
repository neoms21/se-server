'use strict';

const assert = require('assert');
const sinon = require('sinon');
const eventFactory = require('./event-factory');


describe('Event Factory', () => {
    describe('create', () => {
        it('should fill in fields other than command', () => {
            const result = eventFactory.create(undefined, 'MyEvent', false);

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.equal(result.properties.isFailure, false);
            assert.equal(result.properties.messageNumber, 1);
            assert.equal(result.properties.messageCount, 1);
        });

        it('should give error when no name', () => {
            assert.throws(eventFactory.create,
                /Name needs to be specified/);
        });

        it('should fill in isfailure when not supplied', () => {
            const result = eventFactory.create(undefined, 'MyEvent');

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.equal(result.properties.isFailure, false);
        });

        it('should fill in command', () => {
            const result = eventFactory.create({name: 'cmd1', correlationId: 899}, 'MyEvent', false);

            assert.equal(result.properties.eventName, 'MyEvent');
            assert.ok(result.properties);
            assert.ok(result.command);
            assert.equal(result.command.name, 'cmd1');
            assert.equal(result.command.correlationId, 899);
        });

    });
});