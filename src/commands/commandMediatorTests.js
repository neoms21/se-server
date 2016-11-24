const assert = require('assert');
const commandMediator = require('./commandMediator');
const sinon = require('sinon');
const fs = require('fs');
const registerUserActioner = require('./handlers/registerUserCommand');

describe('Action mediator', function () {
    let fsStub;
    let actionMock;

    beforeEach(function () {
        fsStub = sinon.stub(fs, 'readdir', function (path, callback) {
            callback(null, ['registerUserCommand', 'def']);
        });
        actionMock = sinon.mock(registerUserActioner);

    });

    afterEach(function () {
        fs.readdir.restore();
        actionMock.verify();
        actionMock.restore();
    });

    it('should be created', function () {
        assert(commandMediator !== null && commandMediator !== undefined);
    });

    it('should add files in init', function (done) {
        commandMediator.init()
            .subscribe(() => {}, () => {}, () => {
                assert(commandMediator.mappings.length > 0);
                assert(commandMediator.mappings[0].code).equal('registerUserCommand');
                done();
            });

    });

    it('should dispatch registerUserActioner', function () {
        commandMediator.init();

        commandMediator.dispatch({name: 'registerUserActioner', payload: 'hhhhhh'});

    });


});

