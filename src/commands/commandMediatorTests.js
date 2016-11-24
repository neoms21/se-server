const assert = require('assert');
const commandMediator = require('./commandMediator');
const sinon = require('sinon');
const fs = require('fs');
const registerUserActioner = require('./handlers/registerUserCommand');

describe('Action mediator', function() {
    let fsStub;
    let actionMock;

    beforeEach(function() {
        fsStub = sinon.stub(fs, 'readdir', function(path, callback) {
            callback(null, ['registerUserActioner', 'def']);
        });
        actionMock = sinon.mock(registerUserActioner.action);

    });

    afterEach(function() {
        fs.readdir.restore();
        actionMock.verify();
        actionMock.restore();
    });

    it('should be created', function() {
        assert(commandMediator !== null && commandMediator !== undefined);
    });

    it('should add files in init', function() {
        commandMediator.init();

        assert(commandMediator.)
    });

    it('should dispatch registerUserActioner', function() {
        commandMediator.init();

        commandMediator.dispatch({name: 'registerUserActioner', payload: 'hhhhhh'});

    });


});

