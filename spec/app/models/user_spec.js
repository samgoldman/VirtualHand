const User = require('../../../app/models/user').model;
const bcrypt = require('bcrypt');
const user = require('../../../app/models/user');

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

    describe('>validPassword', () => {
        it('should return true if the result of calling bcrypt.compareSync with the provided password and user\'s hashed password is true', () => {
            const testUser = User({'password': 'abc123'});

            expect(testUser.validPassword).toBeDefined();

            const spy_compareSync = spyOn(bcrypt, 'compareSync').and.returnValue(true);

            expect(testUser.validPassword('xyz789')).toEqual(true);

            expect(spy_compareSync.calls.count()).toEqual(1);
            expect(spy_compareSync.calls.argsFor(0).length).toEqual(2);
            expect(spy_compareSync.calls.argsFor(0)[0]).toEqual('xyz789');
            expect(spy_compareSync.calls.argsFor(0)[1]).toEqual('abc123');
        });

        it('should return false if the result of calling bcrypt.compareSync with the provided password and user\'s hashed password is false', () => {
            const testUser = User({'password': 'abc123'});

            expect(testUser.validPassword).toBeDefined();

            const spy_compareSync = spyOn(bcrypt, 'compareSync').and.returnValue(false);

            expect(testUser.validPassword('xyz789')).toEqual(false);

            expect(spy_compareSync.calls.count()).toEqual(1);
            expect(spy_compareSync.calls.argsFor(0).length).toEqual(2);
            expect(spy_compareSync.calls.argsFor(0)[0]).toEqual('xyz789');
            expect(spy_compareSync.calls.argsFor(0)[1]).toEqual('abc123');
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

        it('should search for the given username and if the does not exist, attempt to create one with a generated hash', () => {
            expect(User.findOrCreate).toBeDefined();

            const mock_document_query = {
				then: fn => fn(undefined)
			};

            const spy_hashSync = spyOn(bcrypt, 'hashSync').and.returnValue('abc123');
            const spy_genSaltSync = spyOn(bcrypt, 'genSaltSync').and.returnValue('xyz789');
            const spy_findOne = spyOn(User, 'findOne').and.returnValue(mock_document_query)
            const spy_then = spyOn(mock_document_query, 'then').and.callThrough();
            const spy_create = spyOn(User, 'create').and.returnValue({'username': 'SAMPLE_INPUT'});

            expect(User.findOrCreate('SAMPLE_INPUT')).toEqual({'username': 'SAMPLE_INPUT'});

            expect(spy_hashSync.calls.count()).toEqual(1);

            expect(spy_genSaltSync.calls.count()).toEqual(1);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({username: 'SAMPLE_INPUT'});

            expect(spy_then.calls.count()).toEqual(1);
            expect(spy_then.calls.argsFor(0).length).toEqual(1);

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0).length).toEqual(1);
            expect(spy_create.calls.argsFor(0)[0]).toEqual({username: 'SAMPLE_INPUT', 'password': 'abc123'});
        });
    });

	describe('>pre validate hook', () => {
		it('should update the timestamp when the user is updated', async () => {
			const testUser = User({username: 'testuser', password: 'xyz789', valid: false});

			expect(testUser.timestamp).toBeDefined();

			const original_timestamp = testUser.timestamp;

            while(new Date() <= original_timestamp) {}

			testUser.password = 'abc123';
			await testUser.validate();

			expect(testUser.timestamp).toBeGreaterThan(original_timestamp);
		});
	});
});