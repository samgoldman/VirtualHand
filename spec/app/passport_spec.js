const passport_local = require('passport-local');
const rewire = require('rewire');

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
});