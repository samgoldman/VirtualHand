const {recoverPassword, changePassword, changeStudentPassword} = require("../../../app/io_methods/password_functions");

const randomstring = require("randomstring");
const User = require('../../../app/models/user').model;
const Course = require('../../../app/models/course').model;
const Enrollment = require('../../../app/models/enrollment').model;

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

		it('should update the password if the old password is valid', async () => {
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
			const spy_validPassword = spyOn(test_user, 'validPassword').and.returnValue(true);
			const spy_generateHash = spyOn(test_user, 'generateHash').and.callThrough();

			expect(await changePassword(test_user_id, 'original_password', 'new_password', mock_callback_wrapper.callback)).toEqual(undefined);

			expect(spy_findById.calls.count()).toEqual(1);
			expect(spy_findById.calls.argsFor(0).length).toEqual(1);
			expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

			expect(spy_save.calls.count()).toEqual(1);
			expect(spy_save.calls.argsFor(0).length).toEqual(0);

			expect(spy_generateHash.calls.count()).toEqual(1);
			expect(spy_generateHash.calls.argsFor(0).length).toEqual(1);
			expect(spy_generateHash.calls.argsFor(0)[0]).toEqual('new_password');

			expect(spy_validPassword.calls.count()).toEqual(1);
			expect(spy_validPassword.calls.argsFor(0).length).toEqual(1);
			expect(spy_validPassword.calls.argsFor(0)[0]).toEqual('original_password');

			expect(spy_callback.calls.count()).toEqual(1);
			expect(spy_callback.calls.argsFor(0).length).toEqual(1);
			expect(spy_callback.calls.argsFor(0)[0]).toEqual({success: true, message: 'Password changed successfully'});

			expect(test_user.password).toEqual('hashed_value');
		});

		describe('>changeStudentPassword', () => {
			it('should be defined', () => {
				expect(changeStudentPassword).toBeDefined();
			});

			it('should generate and save a new password if all components come back defined (i.e. they exist)', async () => {
				const student = new User();
				student.password = 'original_password';

				const mock_socket = {
					emit: () => undefined
				};

				const spy_user_findById = spyOn(User, 'findById').and.returnValues(new Promise(done => done("some_value")), new Promise(done => done(student)));
				const spy_course_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done("some_value")));
				const spy_enrollment_find = spyOn(Enrollment, 'find').and.returnValue(new Promise(done => done(["some_other_value", "yet_another_value"])));
				const spy_save = spyOn(student, 'save').and.returnValue(new Promise(done => done(undefined)));
				const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
				const spy_generateHash = spyOn(student, 'generateHash').and.returnValue('hashed_password');

				const teacher_id = 'teacher_id_1';
				const course_id = 'course_id_1';
				const student_id = 'student_id_1';
				const password = 'new_password';

				expect(await changeStudentPassword(mock_socket, teacher_id, course_id, student_id, password)).toBeUndefined();

				expect(spy_user_findById.calls.count()).toEqual(2);
				expect(spy_user_findById.calls.argsFor(0)).toEqual([teacher_id]);
				expect(spy_user_findById.calls.argsFor(1)).toEqual([student_id]);

				expect(spy_course_findOne.calls.count()).toEqual(1);
				expect(spy_course_findOne.calls.argsFor(0)).toEqual([{_id: course_id, teacher: teacher_id, valid: true}]);
				
				expect(spy_enrollment_find.calls.count()).toEqual(1);
				expect(spy_enrollment_find.calls.argsFor(0)).toEqual([{course: course_id, student: student_id, valid: true, enrolled: true}]);

				expect(spy_save.calls.count()).toEqual(1);
				expect(spy_save.calls.argsFor(0).length).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', {success: true, message: 'Successfully changed the password'}]);

				expect(spy_generateHash.calls.count()).toEqual(1);
				expect(spy_generateHash.calls.argsFor(0)).toEqual([password]);

				expect(student.password).toEqual('hashed_password');
			});

			it('should notify the user that the password could not be changed if the query for the teacher comes back undefined', async () => {
				const student = new User();
				student.password = 'original_password';

				const mock_socket = {
					emit: () => undefined
				};

				const spy_user_findById = spyOn(User, 'findById').and.returnValues(new Promise(done => done(undefined)), new Promise(done => done(student)));
				const spy_course_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done("some_value")));
				const spy_enrollment_find = spyOn(Enrollment, 'find').and.returnValue(new Promise(done => done(["some_other_value"])));
				const spy_save = spyOn(student, 'save').and.returnValue(new Promise(done => done(undefined)));
				const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
				const spy_generateHash = spyOn(student, 'generateHash').and.returnValue('hashed_password');

				const teacher_id = 'teacher_id_2';
				const course_id = 'course_id_2';
				const student_id = 'student_id_2';
				const password = 'new_password';

				expect(await changeStudentPassword(mock_socket, teacher_id, course_id, student_id, password)).toBeUndefined();

				expect(spy_user_findById.calls.count()).toEqual(2);
				expect(spy_user_findById.calls.argsFor(0)).toEqual([teacher_id]);
				expect(spy_user_findById.calls.argsFor(1)).toEqual([student_id]);

				expect(spy_course_findOne.calls.count()).toEqual(1);
				expect(spy_course_findOne.calls.argsFor(0)).toEqual([{_id: course_id, teacher: teacher_id, valid: true}]);
				
				expect(spy_enrollment_find.calls.count()).toEqual(1);
				expect(spy_enrollment_find.calls.argsFor(0)).toEqual([{course: course_id, student: student_id, valid: true, enrolled: true}]);

				expect(spy_save.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', {success: false, message: 'Unable to change the students password!'}]);

				expect(spy_generateHash.calls.count()).toEqual(0);
				
				expect(student.password).toEqual('original_password');
			});

			it('should notify the user that the password could not be changed if the query for the course comes back undefined', async () => {
				const student = new User();
				student.password = 'original_password';

				const mock_socket = {
					emit: () => undefined
				};

				const spy_user_findById = spyOn(User, 'findById').and.returnValues(new Promise(done => done("some_teacher")), new Promise(done => done(student)));
				const spy_course_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done(undefined)));
				const spy_enrollment_find = spyOn(Enrollment, 'find').and.returnValue(new Promise(done => done(["some_other_value"])));
				const spy_save = spyOn(student, 'save').and.returnValue(new Promise(done => done(undefined)));
				const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
				const spy_generateHash = spyOn(student, 'generateHash').and.returnValue('hashed_password');

				const teacher_id = 'teacher_id_3';
				const course_id = 'course_id_3';
				const student_id = 'student_id_3';
				const password = 'new_password';

				expect(await changeStudentPassword(mock_socket, teacher_id, course_id, student_id, password)).toBeUndefined();

				expect(spy_user_findById.calls.count()).toEqual(2);
				expect(spy_user_findById.calls.argsFor(0)).toEqual([teacher_id]);
				expect(spy_user_findById.calls.argsFor(1)).toEqual([student_id]);

				expect(spy_course_findOne.calls.count()).toEqual(1);
				expect(spy_course_findOne.calls.argsFor(0)).toEqual([{_id: course_id, teacher: teacher_id, valid: true}]);
				
				expect(spy_enrollment_find.calls.count()).toEqual(1);
				expect(spy_enrollment_find.calls.argsFor(0)).toEqual([{course: course_id, student: student_id, valid: true, enrolled: true}]);

				expect(spy_save.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', {success: false, message: 'Unable to change the students password!'}]);

				expect(spy_generateHash.calls.count()).toEqual(0);
				
				expect(student.password).toEqual('original_password');
			});

			it('should notify the user that the password could not be changed if the query for the enrollment comes back undefined', async () => {
				const student = new User();
				student.password = 'original_password';

				const mock_socket = {
					emit: () => undefined
				};

				const spy_user_findById = spyOn(User, 'findById').and.returnValues(new Promise(done => done("some_teacher")), new Promise(done => done(student)));
				const spy_course_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done("some_course")));
				const spy_enrollment_find = spyOn(Enrollment, 'find').and.returnValue(new Promise(done => done(undefined)));
				const spy_save = spyOn(student, 'save').and.returnValue(new Promise(done => done(undefined)));
				const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
				const spy_generateHash = spyOn(student, 'generateHash').and.returnValue('hashed_password');

				const teacher_id = 'teacher_id_4';
				const course_id = 'course_id_4';
				const student_id = 'student_id_4';
				const password = 'new_password';

				expect(await changeStudentPassword(mock_socket, teacher_id, course_id, student_id, password)).toBeUndefined();

				expect(spy_user_findById.calls.count()).toEqual(2);
				expect(spy_user_findById.calls.argsFor(0)).toEqual([teacher_id]);
				expect(spy_user_findById.calls.argsFor(1)).toEqual([student_id]);

				expect(spy_course_findOne.calls.count()).toEqual(1);
				expect(spy_course_findOne.calls.argsFor(0)).toEqual([{_id: course_id, teacher: teacher_id, valid: true}]);
				
				expect(spy_enrollment_find.calls.count()).toEqual(1);
				expect(spy_enrollment_find.calls.argsFor(0)).toEqual([{course: course_id, student: student_id, valid: true, enrolled: true}]);

				expect(spy_save.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', {success: false, message: 'Unable to change the students password!'}]);

				expect(spy_generateHash.calls.count()).toEqual(0);
				
				expect(student.password).toEqual('original_password');
			});

			it('should notify the user that the password could not be changed if the query for the student comes back undefined', async () => {
				const student = new User();
				student.password = 'original_password';

				const mock_socket = {
					emit: () => undefined
				};

				const spy_user_findById = spyOn(User, 'findById').and.returnValues(new Promise(done => done("some_teacher")), new Promise(done => done(undefined)));
				const spy_course_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done("some_course")));
				const spy_enrollment_find = spyOn(Enrollment, 'find').and.returnValue(new Promise(done => done(["enrollment"])));
				const spy_save = spyOn(student, 'save').and.returnValue(new Promise(done => done(undefined)));
				const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
				const spy_generateHash = spyOn(student, 'generateHash').and.returnValue('hashed_password');

				const teacher_id = 'teacher_id_5';
				const course_id = 'course_id_5';
				const student_id = 'student_id_5';
				const password = 'new_password';

				expect(await changeStudentPassword(mock_socket, teacher_id, course_id, student_id, password)).toBeUndefined();

				expect(spy_user_findById.calls.count()).toEqual(2);
				expect(spy_user_findById.calls.argsFor(0)).toEqual([teacher_id]);
				expect(spy_user_findById.calls.argsFor(1)).toEqual([student_id]);

				expect(spy_course_findOne.calls.count()).toEqual(1);
				expect(spy_course_findOne.calls.argsFor(0)).toEqual([{_id: course_id, teacher: teacher_id, valid: true}]);
				
				expect(spy_enrollment_find.calls.count()).toEqual(1);
				expect(spy_enrollment_find.calls.argsFor(0)).toEqual([{course: course_id, student: student_id, valid: true, enrolled: true}]);

				expect(spy_save.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', {success: false, message: 'Unable to change the students password!'}]);

				expect(spy_generateHash.calls.count()).toEqual(0);
				
				expect(student.password).toEqual('original_password');
			});

		});
	})
});
