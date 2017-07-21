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

        timeStub = sinon.stub(generalServices, 'getTime',
            () => new Date('01 Sep 2016 08:00'));
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

            updateSpy = sinon.stub(mongoRepository, 'update', function (collectionName,
                                                                        key, updates) {
                assert(updates.players[2].id === 'abc223');
                assert(updates.properties === undefined);
                assert.notEqual(updates.players[2].properties, undefined);

                done();
            });

            queryStub = sinon.stub(mongoRepository, 'query', function () {
                // supply dummy observable
                return Rx.Observable.of({
                    _id: '507f1f77bcf86cd799439011',
                    squadName: 's1',
                    players: [
                        {
                            playerName: 'MS',
                            email: 'neo@gma.com',
                            id: '1234'
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
                    payload: {
                        player: {squadId: '507f1f77bcf86cd799439011'}
                    }
                },
                properties: {
                    eventName: 'CreatePlayerEvent'
                }
            });
            assert(queryStub.called);
            assert(updateSpy.called);
        });


    });

    describe('player edit', function () {

        it('create replace the user if id exists', function (done) {

            updateSpy = sinon.stub(mongoRepository, 'update', function (r, x, y) {
                assert(y.players[1].email === 'asjk@sde.com');

                done();
            });

            queryStub = sinon.stub(mongoRepository, 'query', function () {
                // supply dummy observable
                return Rx.Observable.of({
                    _id: '507f1f77bcf86cd799439011',
                    squadName: 's1',
                    players: [
                        {
                            squadId: '507f1f77bcf86cd799439011',
                            playerName: "existing",
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
                    payload: {
                        player: {
                            squadId: '507f1f77bcf86cd799439011',
                            id: 'abc223',
                            email: 'asjk@sde.com'
                        }
                    }
                },
                properties: {
                    eventName: 'CreatePlayerEvent'
                }
            });
            assert(queryStub.called);
            assert(updateSpy.called);
        });


    });

    describe('player delete', function () {

        it('mark the player as deleted if delete event', function (done) {

            updateSpy = sinon.stub(mongoRepository, 'update', function (r, x, y) {
                assert(y.players[1].isDeleted === true);

                done();
            });

            queryStub = sinon.stub(mongoRepository, 'query', function () {
                // supply dummy observable
                return Rx.Observable.of({
                    _id: '507f1f77bcf86cd799439011',
                    squadName: 's1',
                    players: [
                        {
                            squadId: '507f1f77bcf86cd799439011',
                            playerName: "existing",
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
                    payload: {
                        player: {
                            squadId: '507f1f77bcf86cd799439011',
                            id: 'abc223',
                            email: 'asjk@sde.com'
                        }
                    }
                },
                properties: {
                    eventName: 'DeletePlayerEvent'
                }
            });
            assert(queryStub.called);
            assert(updateSpy.called);
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

