'use strict';
const login = require('./login');
const assert = require('assert');
const sinon = require('sinon');
const Rx = require('rxjs/Rx');
const mongoRepository = require('./../db/mongo-repository');


describe('Login routes ', () => {

    beforeEach(() => {

    });

    afterEach(() => {
        //loggerErrorSpy.restore();
        //loggerInfoSpy.restore();
    });

    describe('setup', () => {
        it('should have been created correctly', () => {
            assert.notEqual(login, null);
            assert.notEqual(login, undefined);
        });
    });

    describe('post login', () => {
        let request;
        let response;
        let logger;
        let statusSpy;
        let sendSpy;
        let mongoRepoStub;
        let loggerErrorSpy;
        let loggerInfoSpy;

        beforeEach(() => {
            request = {body: {}};
            response = {
                status: () => {
                    return response;
                }, send: () => {
                }
            };
            logger = {
                info: () => {
                }, error: () => {
                }
            };
            statusSpy = sinon.spy(response, 'status');
            sendSpy = sinon.spy(response, 'send');
            loggerErrorSpy = sinon.spy(logger, 'error');
            loggerInfoSpy = sinon.spy(logger, 'info');
        });

        afterEach(() => {
            statusSpy.restore();
            sendSpy.restore();
        });

        it('should error if no user set in body', () => {
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined'));
        });

        it('should error if user not set correctly in body', () => {
            request.body = {email: 'kkkkk', Password: '@@@'};
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined correctly'));
        });

        it('should error if user half set correctly in body', () => {
            request.body = {userName: 'kkkkk', Password: '@@@'};
            login.postLogin(request, response);

            assert(statusSpy.calledWith(203));
            assert(sendSpy.calledWith('User details not defined correctly'));
        });

        it('should error if repo throws error', () => {
            mongoRepoStub = sinon.stub(mongoRepository, 'getCount')
                .returns(Rx.Observable.throw(new Error('DB Fault')));

            request.body = {userName: 'kkkkk', password: '@@@'};
            login.postLogin(request, response, logger);

            setTimeout(() => {
                assert(loggerErrorSpy.called);
                assert(loggerErrorSpy.calledWith('Database Error: DB Fault'));
                assert(statusSpy.called);
                assert(statusSpy.calledWith(500));
            }, 100);

            mongoRepoStub.restore();
        });

        it('should use post to set up login', () => {

            request.body = {userName: 'kkkkk', password: '@@@'};
            login.postLogin(request, response);


        });
    });

});

