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
});