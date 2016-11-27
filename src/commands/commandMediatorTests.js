const assert = require('assert');
const commandMediator = require('./commandMediator');
const sinon = require('sinon');
const fs = require('fs');
const registerUserCommand = require('./handlers/registerUserCommand');
const CommandFactory = require('./commandFactory');
const Rx = require('rx');

describe('Action mediator', function () {

    let mappingsRead = 0;
    let fsStub;
    let actionMock;
    let cmdMock;

    before(function (done) {
        fsStub = sinon.stub(fs, 'readdir', function (path, callback) {
            // supply dummy filenames
            callback(null, ['registerUserCommand.js', 'loginUserCommand.js']);
        });
        actionMock = sinon.mock(registerUserCommand);
        cmdMock = sinon.stub(CommandFactory, 'start', function() {
            return Rx.Observable.from(['sample']);
        });

        let subs = commandMediator.getObservable()
            .subscribe((r) => {
                mappingsRead = r.commandCount;
                subs.dispose();
                done();
            }, (err) => {
                assert(err).equal('');
                done();
            });

        commandMediator.init();
    });

    after(function () {
        fs.readdir.restore();
        actionMock.verify();
        actionMock.restore();
        cmdMock.restore();
    });

    beforeEach(function () {

    });

    afterEach(function () {

    });

    it('should be created', function () {
        assert(commandMediator !== null && commandMediator !== undefined);
    });

    it('should add files in init', function () {
        assert(mappingsRead === 2);
    });

    it('shouldnt find non matching command', function () {
        var res = commandMediator.dispatch({code: 'registerChelski', name: 'hhhhhh'});
        assert.equal(res.status, 501);
        assert.equal(res.message, "Couldn\'t find registerChelski command");
    });

    // it('shouldnt find non matching command', function (done) {
    //     let subs = commandMediator.getObservable()
    //         .subscribe((r) => {
    //             if (r.constructor.name === 'CommandExecuted') {
    //                 subs.dispose();
    //                 done();
    //             }
    //         }, (err) => {
    //             fail(err);
    //             assert(err).equal('');
    //             done();
    //         });
    //
    //     commandMediator.dispatch({code: 'registerChelski', name: 'hhhhhh'});
    //
    // });

    it('should dispatch registerUser command', function (done) {
        let mappingsRead = 0;
        let subs = commandMediator.getObservable()
            .subscribe((r) => {
                // not finished until commandexecuted message is sent
                if (r.constructor.name === 'CommandExecuted') {
                    subs.dispose();
                    done();
                }
            }, (err) => {
                assert.equal(err, '');
                done();
            });

        commandMediator.dispatch({code: 'registerUser', name: 'hhhhhh', userName: 'john', password: 'mammm000'});

    });
});


