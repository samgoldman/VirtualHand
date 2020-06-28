const {recoverPassword, changePassword} = require("../../../app/io_methods/password_functions");

const randomstring = require("randomstring");
const User = require('../../../app/models/user').model;

const mock_transport = {
	sendMail: () => {}
}

const mock_callback_wrapper = {
	callback: () => {}
}

describe('Password Functions', () => {
	describe('>recoverPassword', () => {
		it('should not reset the password if the user has no email', async () => {
			expect(recoverPassword).toBeDefined();

			const test_username = 'testUser';

			const test_user = {
				password: 'original_password',
				generateHash: () => 'hashed_value',
				save: () => {}
			};

			const mock_documentQuery = {
				exec: () => new Promise((done) => done(test_user))
			}

			const spy_callback = spyOn(mock_callback_wrapper, 'callback').and.callThrough();
			const spy_findOne = spyOn(User, 'findOne').and.returnValue(mock_documentQuery);
			const spy_sendMail = spyOn(mock_transport, 'sendMail').and.returnValue(new Promise(() => {}));
			const spy_exec = spyOn(mock_documentQuery, 'exec').and.callThrough();
			const spy_generate = spyOn(randomstring, 'generate').and.returnValue('random_value');
			const spy_save = spyOn(test_user, 'save').and.callThrough();
			const spy_generateHash = spyOn(test_user, 'generateHash').and.callThrough();

			expect(await recoverPassword(test_username, mock_transport, mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findOne.calls.count()).toEqual(1);
			expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
			expect(spy_findOne.calls.argsFor(0)[0]).toEqual({'username': test_username});

			expect(spy_exec.calls.count()).toEqual(1);
			expect(spy_exec.calls.argsFor(0).length).toEqual(0);

			expect(spy_save.calls.count()).toEqual(0);

			expect(spy_generateHash.calls.count()).toEqual(0);

			expect(spy_sendMail.calls.count()).toEqual(0);

			expect(spy_generate.calls.count()).toEqual(0);

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual({message: "Cannot recover password: either user does not exist or the user has no email on record."});

			expect(test_user.password).toEqual('original_password');
		});

		it('should create a new password and email it to the user if the user has an email', async () => {
			expect(recoverPassword).toBeDefined();

			const test_username = 'testUser';

			const test_user = {
				password: 'original_password',
				email: 'example@example.com',
				generateHash: () => 'hashed_value',
				save: () => {}
			};

			const mock_documentQuery = {
				exec: () => new Promise((done) => done(test_user))
			}

			const spy_callback = spyOn(mock_callback_wrapper, 'callback').and.callThrough();
			const spy_findOne = spyOn(User, 'findOne').and.returnValue(mock_documentQuery);
			const spy_sendMail = spyOn(mock_transport, 'sendMail').and.returnValue(new Promise(() => {}));
			const spy_exec = spyOn(mock_documentQuery, 'exec').and.callThrough();
			const spy_generate = spyOn(randomstring, 'generate').and.returnValue('random_value');
			const spy_save = spyOn(test_user, 'save').and.callThrough();
			const spy_generateHash = spyOn(test_user, 'generateHash').and.callThrough();

			expect(await recoverPassword(test_username, mock_transport, mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findOne.calls.count()).toEqual(1);
			expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
			expect(spy_findOne.calls.argsFor(0)[0]).toEqual({'username': test_username});

			expect(spy_exec.calls.count()).toEqual(1);
			expect(spy_exec.calls.argsFor(0).length).toEqual(0);

			expect(spy_save.calls.count()).toEqual(1);
			expect(spy_save.calls.argsFor(0).length).toEqual(0);

			expect(spy_generateHash.calls.count()).toEqual(1);
			expect(spy_generateHash.calls.argsFor(0).length).toEqual(1);
			expect(spy_generateHash.calls.argsFor(0)[0]).toEqual('random_value');

			expect(spy_sendMail.calls.count()).toEqual(1);
			expect(spy_sendMail.calls.argsFor(0).length).toEqual(1);
			expect(spy_sendMail.calls.argsFor(0)[0]).toEqual({
				to: "example@example.com",
				subject: 'Virtual Hand Password Reset',
				text: `Virtual Hand has received a request for your account's password to be reset. Your new password is: random_value \nPlease change it right away.`
			});

			expect(spy_generate.calls.count()).toEqual(1);
			expect(spy_generate.calls.argsFor(0).length).toEqual(1);
			expect(spy_generate.calls.argsFor(0)[0]).toEqual(12)

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual({message: "Your password has been reset. Please check your email for your new password."});

			expect(test_user.password).toEqual('hashed_value');
		});
	});

	describe('>changePassword', () => {
		it('should not update the password if the user id is not valid', async () => {
			expect(changePassword).toBeDefined();

			const test_user_id = 'abc123';

			const test_user = {
				password: 'original_password',
				generateHash: () => 'hashed_value',
				validPassword: () => {},
				save: () => {}
			};

			const spy_callback = spyOn(mock_callback_wrapper, 'callback').and.callThrough();
			const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise((done) => done(null)));
			const spy_save = spyOn(test_user, 'save').and.callThrough();
			const spy_validPassword = spyOn(test_user, 'validPassword').and.returnValue(false);
			const spy_generateHash = spyOn(test_user, 'generateHash').and.callThrough();

			expect(await changePassword(test_user_id, 'original_password', 'new_password', mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findById.calls.count()).toEqual(1);
			expect(spy_findById.calls.argsFor(0).length).toEqual(1);
			expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

			expect(spy_save.calls.count()).toEqual(0);

			expect(spy_generateHash.calls.count()).toEqual(0);

			expect(spy_validPassword.calls.count()).toEqual(0);

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual({success: false, message: 'Error: invalid user id'});

			expect(test_user.password).toEqual('original_password');
		});

		it('should not update the password if the old password is not valid', async () => {
			expect(changePassword).toBeDefined();

			const test_user_id = 'abc123';

			const test_user = {
				password: 'original_password',
				generateHash: () => 'hashed_value',
				validPassword: () => {},
				save: () => {}
			};

			const spy_callback = spyOn(mock_callback_wrapper, 'callback').and.callThrough();
			const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise((done) => done(test_user)));
			const spy_save = spyOn(test_user, 'save').and.callThrough();
			const spy_validPassword = spyOn(test_user, 'validPassword').and.returnValue(false);
			const spy_generateHash = spyOn(test_user, 'generateHash').and.callThrough();

			expect(await changePassword(test_user_id, 'original_password', 'new_password', mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findById.calls.count()).toEqual(1);
			expect(spy_findById.calls.argsFor(0).length).toEqual(1);
			expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

			expect(spy_save.calls.count()).toEqual(0);

			expect(spy_generateHash.calls.count()).toEqual(0);

			expect(spy_validPassword.calls.count()).toEqual(1);
			expect(spy_validPassword.calls.argsFor(0).length).toEqual(1);
			expect(spy_validPassword.calls.argsFor(0)[0]).toEqual('original_password');

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual({success: false, message: 'Error: incorrect old password'});

			expect(test_user.password).toEqual('original_password');
		});

		it('should update the password if the old password is valid', () => {});
	})
});
