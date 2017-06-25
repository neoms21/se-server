const sinon = require('sinon');
const mongoRepository = require('../db/mongo-repository');
const deNormalizer = require('./players-denormalizer');
const Rx = require('rxjs/Rx');
const eventMediator = require('../cqrs/event-mediator');
const generalServices = require('../cqrs/general-services');
const Guid = require('uuid');
const assert = require('assert');

describe('Players denormalizer Tests', function () {
    let queryStub;
    let timeStub;
    let loggerStub;
    let dispatchStub, guidStub, updateSpy;

    beforeEach(function () {

        timeStub = sinon.stub(generalServices, 'getTime', () => new Date('01 Sep 2016 08:00'));
        loggerStub = {
            info: function () {
            }
        };
        eventMediator.init(loggerStub);
        dispatchStub = sinon.stub(eventMediator, 'dispatch', function () {
        });

    });

    afterEach(function () {
        queryStub.restore();
        timeStub.restore();
        dispatchStub.restore();
        guidStub.restore();
        updateSpy.restore();
    });

    describe('player creation', function () {

        it('create the user with id', function (done) {

            updateSpy = sinon.stub(mongoRepository, 'update', function (r, x) {
                assert(x.players[2].id === 'abc223');
            });

            queryStub = sinon.stub(mongoRepository, 'query', function () {
                // supply dummy observable
                return Rx.Observable.of({
                    _id: '507f1f77bcf86cd799439011',
                    squadName: 's1',
                    players: [{playerName: 'MS', email: 'neo@gma.com', id: '1234'}, {
                        playerName: 'MS1',
                        email: 'neo@gddma.com'
                    }]
                });
            });
            guidStub = sinon.stub(Guid, 'v4', function () {
                return 'abc223';
            });
            deNormalizer.handleMessage({command: {player: {squadId: '507f1f77bcf86cd799439011'}}});
            assert(queryStub.called);
            assert(updateSpy.called);
            done();
        });


    });

    describe('player edit', function () {

        it('create replace the user if id exists', function (done) {

            updateSpy = sinon.stub(mongoRepository, 'update', function (r, x) {
                console.log(x);
                assert(x.players[1].email === 'asjk@sde.com');
            });

            queryStub = sinon.stub(mongoRepository, 'query', function () {
                // supply dummy observable
                return Rx.Observable.of({
                    _id: '507f1f77bcf86cd799439011',
                    squadName: 's1',
                    players: [
                        {
                            squadId: '507f1f77bcf86cd799439011',
                            playerName:"existing",
                            id: 'abc223',
                            email: 'xxxx'
                        },
                        {
                            playerName: 'MS1',
                            email: 'neo@gddma.com'
                        }]
                });
            });
            guidStub = sinon.stub(Guid, 'v4', function () {
                return 'abc223';
            });
            deNormalizer.handleMessage({
                command: {
                    player: {
                        squadId: '507f1f77bcf86cd799439011',
                        id: 'abc223',
                        email: 'asjk@sde.com'
                    }
                }
            });
            assert(queryStub.called);
            assert(updateSpy.called);
            done();
        });


    });

    // describe('getMessages', function () {
    //
    //     it('should return correct messages', function () {
    //
    //         const msgList = deNormalizer.getMessages();
    //         chai.assert.isArray(msgList, 'Should be array');
    //         chai.assert.equal(msgList.length, 1);
    //         chai.assert.equal(msgList[0], 'UserRegisteredEvent');
    //     });
    //
    // });
});

