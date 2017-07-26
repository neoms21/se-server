const sinon = require('sinon');
const assert = require('assert');
const mongoRepository = require('../../db/mongo-repository');
const handler = require('./CreatePlayerHandler');
const Rx = require('rxjs/Rx');

describe('Create Player command', function () {
    let countStub;
    let count = 0;
    let timeStub;

    beforeEach(function () {

    });

    afterEach(function () {

        countStub.restore();
    });

    describe('Verify', function () {
        it('should reply with no error when its a modification to existing player',
            function (done) {

                handler.command = {
                    payload: {
                        player: {
                            playerName: 'MS', email: 'neo@gma.com', phone: '090909',
                            id: '1234'
                        }
                    }
                };

                countStub = sinon.stub(mongoRepository, 'query', function () {
                    // supply dummy observable
                    return Rx.Observable.of({
                        _id: '1',
                        squadName: 's1',
                        players: [{playerName: 'MS', email: 'neo@gma.com', id: '1234'}, {
                            playerName: 'MS1',
                            email: 'neo@gddma.com'
                        }]
                    });
                });
                handler.verify().toArray()
                    .subscribe(function (errors) {
                        assert.equal(errors instanceof Array, true);
                        assert.equal(errors.length, 0);

                    }, function (err) {
                        assert(err, null);
                    }, function () {
                        done();
                    });
            });

    });

});

