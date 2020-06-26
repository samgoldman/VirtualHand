const {recoverPassword} = require("../../../app/io_methods/password_functions");

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

			const mock_documentQuery = {
				exec: () => new Promise((done) => done({}))
			}

			const spy_callback = spyOn(mock_callback_wrapper, 'callback').and.callThrough();
			const spy_findOne = spyOn(User, 'findOne').and.returnValue(mock_documentQuery);
			const spy_sendMail = spyOn(mock_transport, 'sendMail').and.callThrough();
			const spy_exec = spyOn(mock_documentQuery, 'exec').and.callThrough();
			const spy_generate = spyOn(randomstring, 'generate').and.callThrough();

			expect(await recoverPassword(test_username, mock_transport, mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findOne.calls.count()).toEqual(1);
			expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
			expect(spy_findOne.calls.argsFor(0)[0]).toEqual({'username': test_username});

			expect(spy_exec.calls.count()).toEqual(1);
			expect(spy_exec.calls.argsFor(0).length).toEqual(0);

			expect(spy_sendMail.calls.count()).toEqual(0);

			expect(spy_generate.calls.count()).toEqual(0);

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual("Cannot recover password: either user does not exist or the user has no email on record.");
		});
	});
});