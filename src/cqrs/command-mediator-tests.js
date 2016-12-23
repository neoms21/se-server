import {Logger} from 'bunyan';
import {CommandMediator} from './command-mediator';
import * as assert from 'assert';
import * as sinon from 'sinon';

describe('Action mediator', function () {

    let mappingsRead = 0;
    let fsStub: any;
    let actionMock: any;
    let cmdMock: any;
    let logMock: any;

    before(function (done) {
        // fsStub = sinon.stub(fs, 'readdir', function (path: string, callback: Function) {
        //     // supply dummy filenames
        //     callback(null, ['registerUserCommand.js', 'loginUserCommand.js']);
        // });
//        actionMock = sinon.mock(RegisterUserCommand);
        // cmdMock = sinon.stub(CommandFactory, 'start', function() {
        //     return Rx.Observable.from(['sample']);
        // });

        logMock = sinon.stub(Logger);

        let subs = CommandMediator.propagator
            .subscribe((r: any) => {
                mappingsRead = r.commandCount;
                subs.unsubscribe();
                done();
            }, (err: any) => {
                assert.equal(err, '');
                done();
            });

        CommandMediator.init(logMock);
    });

    after(function () {
        //fs.readdir.r();
        actionMock.verify();
        actionMock.restore();
        cmdMock.restore();
    });


    // it('should add files in init', function () {
    //     assert(mappingsRead === 2);
    // });


    it('shouldnt find non matching command', function () {
        let res = CommandMediator.dispatch({commandName: 'registerChelski', correlationId: '@'});
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
        let subs = CommandMediator.propagator
            .subscribe((r) => {
                // not finished until commandexecuted message is sent
                if (r.constructor.name === 'CommandExecuted') {
                    subs.unsubscribe();
                    done();
                }
            }, (err) => {
                assert.equal(err, '');
                done();
            });

        CommandMediator.dispatch({commandName: 'registerUser', correlationId: '@'});

    });
});

