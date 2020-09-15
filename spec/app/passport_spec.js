const { sign } = require('jsonwebtoken');
const passport_local = require('passport-local');
const rewire = require('rewire');
const User = require('../../app/models/user').model;
const passport = rewire('../../app/passport');

describe('passport', () => {
    describe('>main', () => {
        it('should be defined', () => {
            expect(passport).toBeDefined();
        });

        it('should setup authentication strategies', () => {
            const mock_passport_param = {
                deserializeUser: () => undefined,
                serializeUser: () => undefined,
                use: () => undefined
            }
            
            const spy_localStrategy = spyOn(passport_local, 'Strategy').and.returnValues('strategy_1', 'strategy_2');
            passport.__set__('LocalStrategy', spy_localStrategy);

            const spy_deserializeUser = spyOn(mock_passport_param, 'deserializeUser').and.callThrough();
            const spy_serializeUser = spyOn(mock_passport_param, 'serializeUser').and.callThrough();
            const spy_use = spyOn(mock_passport_param, 'use').and.callThrough();

            expect(passport(mock_passport_param)).toBeUndefined();

            expect(spy_localStrategy.calls.count()).toEqual(2);
            expect(spy_localStrategy.calls.argsFor(0)).toEqual([{usernameField: 'username', passwordField: 'password', passReqToCallback: true}, passport.__get__('signupStrategy')]);
            expect(spy_localStrategy.calls.argsFor(1)).toEqual([{usernameField: 'username', passwordField: 'password', passReqToCallback: true}, passport.__get__('loginStrategy')]);

            expect(spy_deserializeUser.calls.count()).toEqual(1);
            expect(spy_deserializeUser.calls.argsFor(0)).toEqual([passport.__get__('deserializeUser')]);
            
            expect(spy_serializeUser.calls.count()).toEqual(1);
            expect(spy_serializeUser.calls.argsFor(0)).toEqual([passport.__get__('serializeUser')]);

            expect(spy_use.calls.count()).toEqual(2);
            expect(spy_use.calls.argsFor(0).length).toEqual(2);
            expect(spy_use.calls.argsFor(0)[0]).toEqual('local-signup');
            expect(spy_use.calls.argsFor(1).length).toEqual(2);
            expect(spy_use.calls.argsFor(1)[0]).toEqual('local-login');
        });
    });

    describe('>deserializeUser', () => {
        let deserializeUser = null;

        beforeEach(() => {
            deserializeUser = passport.__get__('deserializeUser');
        });

        it('should be defined', () => {
            expect(deserializeUser).toBeDefined();
        });

        it('to search for a user by id and call done with it', async () => {
            const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise(done => done('user_value')));
            const spy_done = jasmine.createSpy('done').and.returnValue(undefined);

            expect(await deserializeUser('user_id', spy_done)).toBeUndefined();

            expect(spy_findById.calls.count()).toEqual(1);
            expect(spy_findById.calls.argsFor(0)).toEqual(['user_id']);

            expect(spy_done.calls.count()).toEqual(1);
            expect(spy_done.calls.argsFor(0)).toEqual([null, 'user_value']);
        });
    });

    describe('>serializeUser', () => {
        let serializeUser = null;

        beforeEach(() => {
            serializeUser = passport.__get__('serializeUser');
        });

        it('should be defined', () => {
            expect(serializeUser).toBeDefined();
        });

        it('should call done with the users ID', async () => {
            const spy_done = jasmine.createSpy('done').and.returnValue(undefined);

            expect(await serializeUser({_id: 'test_user_id'}, spy_done)).toBeUndefined();

            expect(spy_done.calls.count()).toEqual(1);
            expect(spy_done.calls.argsFor(0)).toEqual([null, 'test_user_id']);
        });
    });

    describe('>signupStrategy', () => {
        let signupStrategy = null;

        beforeEach(() => {
            signupStrategy = passport.__get__('signupStrategy');
        });

        it('should be defined', () => {
            expect(signupStrategy).toBeDefined();
        });

        it('should not create a user if there is already a user with that username', async () => {
            const mock_req = {
                flash: () => 'flash_return_value',
                body: {
                    email: 'example@test.com',
                    role: 'teacher'
                }
            };

            const spy_done = jasmine.createSpy('done').and.returnValue(undefined);
            const spy_flash = spyOn(mock_req, 'flash').and.callThrough();
            const spy_findOne = spyOn(User, 'findOne').and.returnValue(new Promise(done => done('some_user')));
            const spy_create = spyOn(User, 'create').and.returnValue(new Promise(done => done('create_return_value')));
            const spy_generateHash = spyOn(User, 'generateHash').and.returnValue('hashed_val');

            expect(await signupStrategy(mock_req, 'test_username', 'test_pass', spy_done)).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{username: 'test_username'}]);

            expect(spy_done.calls.count()).toEqual(1);
            expect(spy_done.calls.argsFor(0)).toEqual([null, false, 'flash_return_value']);
            
            expect(spy_generateHash.calls.count()).toEqual(0);

            expect(spy_flash.calls.count()).toEqual(1);
            expect(spy_flash.calls.argsFor(0)).toEqual(['signupMessage', 'That username is already taken.']);

            expect(spy_create.calls.count()).toEqual(0);
        });
        
        it('should create a user if there is not already a user with that username', async () => {
            const mock_req = {
                flash: () => 'flash_return_value',
                body: {
                    email: 'example@test.com',
                    role: 'teacher'
                }
            };

            const spy_done = jasmine.createSpy('done').and.returnValue(undefined);
            const spy_flash = spyOn(mock_req, 'flash').and.callThrough();
            const spy_findOne = spyOn(User, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(User, 'create').and.returnValue(new Promise(done => done('create_return_value')));
            const spy_generateHash = spyOn(User, 'generateHash').and.returnValue('hashed_val');

            expect(await signupStrategy(mock_req, 'test_username', 'test_pass', spy_done)).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{username: 'test_username'}]);

            expect(spy_done.calls.count()).toEqual(1);
            expect(spy_done.calls.argsFor(0)).toEqual([null, 'create_return_value']);

            expect(spy_flash.calls.count()).toEqual(0);

            expect(spy_generateHash.calls.count()).toEqual(1);
            expect(spy_generateHash.calls.argsFor(0)).toEqual(['test_pass']);

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0)).toEqual([{username: 'test_username', password: 'hashed_val', email: 'example@test.com', role: 'teacher'}]);
        });
    });
});