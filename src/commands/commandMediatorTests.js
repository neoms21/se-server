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
        let mappingsRead = 0;
        commandMediator.getObservable()
            .subscribe((r) => {
                console.log(JSON.stringify(r));
                mappingsRead = r.commandCount;
                assert(mappingsRead === 2);
                done();
            }, (err) => {
                assert(err).equal('');
                done();
            });

        commandMediator.init();
    });

    it('should dispatch registerUser command', function (done) {
        let mappingsRead = 0;
        commandMediator.getObservable()
            .subscribe((r) => {
                //console.log(JSON.stringify(r));
                if (r.constructor.name === 'CommandExecuted') {
                    mappingsRead = r.commandCount;
                    assert(mappingsRead === 2);
                    done();
                }
            }, (err) => {
                assert(err).equal('');
                done();
            });

        commandMediator.init();

        commandMediator.dispatch({code: 'registerUser', name: 'hhhhhh'});

    });


});

