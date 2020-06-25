const token_manager = require('../app/token_manager');
const jwt = require('jsonwebtoken');

describe("Token Manager", () => {
	describe(">getSocketToken", () => {
		it("should call jwt.sign with a payload of a user id and role when the user is provided", () => {
			expect(token_manager.getSocketToken).toBeDefined();

			const spy_sign = spyOn(jwt, 'sign').and.returnValue('this_is_a_test_token');

			process.env.JWT_SECRET = 'TEST_SECRET';

			expect(token_manager.getSocketToken({'_id': 'test_id', 'role': 'test_user'})).toEqual('this_is_a_test_token');
			expect(jwt.sign).toHaveBeenCalled();
			expect(spy_sign.calls.count()).toEqual(1);
			expect(spy_sign.calls.argsFor(0).length).toEqual(3);
			expect(spy_sign.calls.argsFor(0)[0]).toEqual({
				uid: 'test_id',
				role: 'test_user'
			});
			expect(spy_sign.calls.argsFor(0)[1]).toEqual('TEST_SECRET');
			expect(spy_sign.calls.argsFor(0)[2]).toEqual({
				expiresIn: 60 * 10
			});
		});

		it("should call jwt.sign with a payload of role=guest when the user is not provided",() => {
			expect(token_manager.getSocketToken).toBeDefined();

			const spy_sign = spyOn(jwt, 'sign').and.returnValue('this_is_a_test_token2');

			process.env.JWT_SECRET = 'TEST_SECRET2';

			expect(token_manager.getSocketToken()).toEqual('this_is_a_test_token2');
			expect(jwt.sign).toHaveBeenCalled();
			expect(spy_sign.calls.count()).toEqual(1);
			expect(spy_sign.calls.argsFor(0).length).toEqual(3);
			expect(spy_sign.calls.argsFor(0)[0]).toEqual({
				role: 'guest'
			});
			expect(spy_sign.calls.argsFor(0)[1]).toEqual('TEST_SECRET2');
			expect(spy_sign.calls.argsFor(0)[2]).toEqual({
				expiresIn: 60 * 10
			});
		});
	});

	describe(">verifyToken", () => {
		it("should call jwt.verify with the token, secret and callback", () => {
			expect(token_manager.verifyToken).toBeDefined();

			const spy_verify = spyOn(jwt, 'verify').and.returnValue('DUMMY_RETURN');

			process.env.JWT_SECRET = 'TEST_SECRET';

			expect(token_manager.verifyToken('TEST_TOKEN', 'DUMMY_CALLBACK_VALUE'));
			expect(jwt.verify).toHaveBeenCalled();
			expect(spy_verify.calls.count()).toEqual(1);
			expect(spy_verify.calls.argsFor(0).length).toEqual(3);
			expect(spy_verify.calls.argsFor(0)[0]).toEqual("TEST_TOKEN");
			expect(spy_verify.calls.argsFor(0)[1]).toEqual('TEST_SECRET');
			expect(spy_verify.calls.argsFor(0)[2]).toEqual("DUMMY_CALLBACK_VALUE");
		})
	})
});
