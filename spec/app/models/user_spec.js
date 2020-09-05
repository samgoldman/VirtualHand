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

    describe('>findOrCreate', () => {
        it('should search for the given username and if the user exists, return that user', () => {
            expect(User.findOrCreate).toBeDefined();

            const mock_document_query = {
				then: fn => fn({'username': 'test_username'})
			};

            const spy_hashSync = spyOn(bcrypt, 'hashSync').and.returnValue('abc123');
            const spy_genSaltSync = spyOn(bcrypt, 'genSaltSync').and.returnValue('xyz789');
            const spy_findOne = spyOn(User, 'findOne').and.returnValue(mock_document_query)
            const spy_then = spyOn(mock_document_query, 'then').and.callThrough();
            const spy_create = spyOn(User, 'create').and.returnValue(undefined);

            expect(User.findOrCreate('SAMPLE_INPUT')).toEqual({'username': 'test_username'});

            expect(spy_hashSync.calls.count()).toEqual(0);

            expect(spy_genSaltSync.calls.count()).toEqual(0);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({username: 'SAMPLE_INPUT'});

            expect(spy_then.calls.count()).toEqual(1);
            expect(spy_then.calls.argsFor(0).length).toEqual(1);

            expect(spy_create.calls.count()).toEqual(0);
        });
    })
});