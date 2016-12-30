var CommandMediator = require('./command-mediator');
var assert = require('assert');
var sinon = require('sinon');
var Filehound = require('filehound');
var mongoRepository = require('../db/mongo-repository');
var Rx = require('rxjs/Rx');
var cqrsEventCreator = require('./cqrs-event-creator');
var eventMediator = require('./event-mediator');

var logStub = {
    info: function () {
    },
    error: function () {
    }
};
var fhStub = {
    ext: function () {
    },
    paths: function () {
    },
    match: function () {
    },
    find: function () {
    }
};

describe('Command mediator', function () {
    // var actionMock;
    // var cmdMock;
    var logMock;
    var fhMock;
    var createStub;
    var mongoMock;
    var cqrsEventMock;
    var eventMock;

    before(function () {
        // fsStub = sinon.stub(fs, 'readdir', function (path, callback) {
        //     // supply dummy filenames
        //     callback(null, ['registerUserCommand.js', 'loginUserCommand.js']);
        // });

//        actionMock = sinon.mock(RegisterUserCommand);
        // cmdMock = sinon.stub(CommandFactory, 'start', function() {
        //     return Rx.Observable.from(['sample']);
        // });


    });

    after(function () {
        //fs.readdir.r();
        //actionMock.verify();
        //actionMock.restore();
        //cmdMock.restore();

    });

    beforeEach(function () {
        logMock = sinon.mock(logStub);
        createStub = sinon.stub(Filehound, 'create').returns(fhStub);
        fhMock = sinon.mock(fhStub);
        fhMock.expects('ext').withArgs('js').returns(fhStub);
        fhMock.expects('paths').withArgs(process.cwd() + '/src/commands').returns(fhStub);
        fhMock.expects('match').withArgs('*CommandHandler*').returns(fhStub);
        mongoMock = sinon.mock(mongoRepository);
        cqrsEventMock = sinon.mock(cqrsEventCreator);
        eventMock = sinon.mock(eventMediator);
    });

    afterEach(function () {
        fhMock.verify();
        logMock.verify();
        mongoMock.verify();
        cqrsEventMock.verify();
        fhMock.verify();
        eventMock.verify();
        fhMock.restore();
        createStub.restore();
        logMock.restore();
        mongoMock.restore();
        cqrsEventMock.restore();
        fhMock.restore();
        eventMock.restore();
    });

    describe('init', function () {
        it('should call find on filehound with error', function () {
            fhMock.expects('find').yields('cant find');
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 1 file ', function () {
            fhMock.expects('find').yields(null, ['file.js']);
            CommandMediator.init(logStub);
        });

        it('should call find on filehound with successful 3 files', function () {
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);
            CommandMediator.init(logStub);
        });
    });

    describe('saveCommand', function () {
        var command = {commandName: 'file'};

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);

            CommandMediator.init(logStub);
        });

        it('should call insert on repository with success result', function () {
            var event = {id: 1};
            // give success response to insert on repository
            mongoMock.expects('insert').returns(Rx.Observable.of(1));
            cqrsEventMock.expects('CommandSaved').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            CommandMediator.saveCommand(command);
        });

        it('should call insert on repository with error result', function () {
            var event = {id: 1};
            // give success response to insert on repository
            mongoMock.expects('insert').returns(Rx.Observable.throw(new Error()));
            cqrsEventMock.expects('SaveCommandError').withArgs(command).returns(event);
            eventMock.expects('dispatch').withArgs(event);

            CommandMediator.saveCommand(command);
        });
    });

    describe('createCommand', function () {

        beforeEach(function () {
            // set up our mocks
            fhMock.expects('find').yields(null, ['file.js', 'second.js', 'third.js']);

            CommandMediator.init(logStub);
        });

        it('should create the command with supplied info', function () {
            var request = {commandName: 'SaveUser', payload: {id: 1, name: 'john'}};

            var command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.commandName, 'SaveUser');
            assert.equal(command.id, 1);
            assert.equal(command.name, 'john');
        });

        it('should create the command with supplied info, but no payload', function () {
            var request = {commandName: 'SaveUser'};

            var command = CommandMediator.createCommand(request);

            assert.notEqual(command, null);
            assert.notEqual(command, undefined);
            assert.equal(command.commandName, 'SaveUser');
            assert.equal(command.id, undefined);
            assert.equal(command.name, undefined);
        });

        it('shouldnt create the command without supplied command name', function () {
            var request = {commandNameXXX: 'SaveUser'};

            var command = CommandMediator.createCommand(request);

            assert.equal(command, undefined);
        });
    });


    // it('shouldnt find non matching command', function () {
    //     var res = CommandMediator.dispatch({commandName: 'registerChelski', correlationId: '@'});
    //     assert.equal(res.status, 501);
    //     assert.equal(res.message, "Couldn\'t find registerChelski command");
    // });

    // it('shouldnt find non matching command', function (done) {
    //     var subs = commandMediator.getObservable()
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

    // it('should dispatch command', function (done) {
    //     var mappingsRead = 0;
    //     var subs = CommandMediator.propagator
    //         .subscribe(function (r) {
    //                 // not finished until commandexecuted message is sent
    //                 if (r.constructor.name === 'CommandExecuted') {
    //                     subs.unsubscribe();
    //                     done();
    //                 }
    //             },
    //             function (err) {
    //                 assert.equal(err, '');
    //                 done();
    //             }
    //         );
    //
    //     CommandMediator.dispatch({commandName: 'registerUser', correlationId: '@'});
    //
    // });
});


