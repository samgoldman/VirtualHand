const User = require('../../../app/models/user').model;
const bcrypt = require('bcrypt');

describe('user', () => {
    describe('>generateHash', () => {
        it('should call bcrypt.hashSync with the given password and return the result', () => {
            const testUser = User();
            
            expect(testUser.generateHash).toBeDefined();

            const spy_hashSync = spyOn(bcrypt, 'hashSync').and.returnValue('abc123');
            const spy_genSaltSync = spyOn(bcrypt, 'genSaltSync').and.returnValue('xyz789');

            expect(testUser.generateHash('test_pass')).toEqual('abc123');

            expect(spy_hashSync.calls.count()).toEqual(1);
            expect(spy_hashSync.calls.argsFor(0).length).toEqual(2);
            expect(spy_hashSync.calls.argsFor(0)[0]).toEqual('test_pass');
            expect(spy_hashSync.calls.argsFor(0)[1]).toEqual('xyz789');

            expect(spy_genSaltSync.calls.count()).toEqual(1);
            expect(spy_genSaltSync.calls.argsFor(0).length).toEqual(1);
            expect(spy_genSaltSync.calls.argsFor(0)[0]).toEqual(10);
        });
    });
});