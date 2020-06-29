const Course = require('../../../app/models/course').model;
const User = require('../../../app/models/user').model;
const {createCourse, renameCourse} = require('../../../app/io_methods/course_functions');

const mock_socket = {
	emit: () => {}
}

describe('Course Functions', () => {
	describe('>createCourse', () => {
		[undefined, null, ''].forEach(courseName => {
			it(`should not create the course if the course name is ${courseName}`, async () => {
				expect(createCourse).toBeDefined();

				const test_user_id = 'abc123';

				const test_user = {
					_id: 'abc123'
				};

				const test_course = {
					_id: '424242'
				};

				const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise(done => done(test_user)));
				const spy_create = spyOn(Course, 'create').and.returnValue(new Promise(done => done(test_course)));
				const spy_emit = spyOn(mock_socket, 'emit').and.returnValue(undefined);

				expect(await createCourse(mock_socket, test_user_id, courseName)).toEqual(undefined);

				expect(spy_findById.calls.count()).toEqual(1);
				expect(spy_findById.calls.argsFor(0).length).toEqual(1);
				expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

				expect(spy_create.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0).length).toEqual(2);
				expect(spy_emit.calls.argsFor(0)[0]).toEqual('Response_CourseCreate');
				expect(spy_emit.calls.argsFor(0)[1]).toEqual({
					success: false,
					message: 'Class not created: Name must not be blank!'
				});

				expect(test_course._id).toEqual('424242');
			});
		});

		it('should not create the course if the user ID is invalid', async () => {
			expect(createCourse).toBeDefined();

			const test_user_id = 'abc123';

			const test_course = {
				_id: '424242'
			};

			const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise(done => done(undefined)));
			const spy_create = spyOn(Course, 'create').and.returnValue(new Promise(done => done(test_course)));
			const spy_emit = spyOn(mock_socket, 'emit').and.returnValue(undefined);

			expect(await createCourse(mock_socket, test_user_id, 'test_course')).toEqual(undefined);

			expect(spy_findById.calls.count()).toEqual(1);
			expect(spy_findById.calls.argsFor(0).length).toEqual(1);
			expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

			expect(spy_create.calls.count()).toEqual(0);

			expect(spy_emit.calls.count()).toEqual(1);
			expect(spy_emit.calls.argsFor(0).length).toEqual(2);
			expect(spy_emit.calls.argsFor(0)[0]).toEqual('Response_CourseCreate');
			expect(spy_emit.calls.argsFor(0)[1]).toEqual({
				success: false,
				message: 'Class not created: user ID is invalid'
			});

			expect(test_course._id).toEqual('424242');
		});

		it('should create the course if all criteria are met', async () => {
			expect(createCourse).toBeDefined();

			const test_user_id = 'abc123';

			const test_user = {
				_id: 'abc123'
			};

			const test_course = {
				_id: '424242'
			};

			const spy_findById = spyOn(User, 'findById').and.returnValue(new Promise(done => done(test_user)));
			const spy_create = spyOn(Course, 'create').and.returnValue(new Promise(done => done(test_course)));
			const spy_emit = spyOn(mock_socket, 'emit').and.returnValue(undefined);

			expect(await createCourse(mock_socket, test_user_id, 'random_course_name')).toEqual(undefined);

			expect(spy_findById.calls.count()).toEqual(1);
			expect(spy_findById.calls.argsFor(0).length).toEqual(1);
			expect(spy_findById.calls.argsFor(0)[0]).toEqual(test_user_id);

			expect(spy_create.calls.count()).toEqual(1);
			expect(spy_create.calls.argsFor(0).length).toEqual(1);
			expect(spy_create.calls.argsFor(0)[0]).toEqual({teacher: test_user_id, courseName: 'random_course_name'});

			expect(spy_emit.calls.count()).toEqual(1);
			expect(spy_emit.calls.argsFor(0).length).toEqual(2);
			expect(spy_emit.calls.argsFor(0)[0]).toEqual('Response_CourseCreate');
			expect(spy_emit.calls.argsFor(0)[1]).toEqual({
				courseId: '424242',
				courseName: 'random_course_name',
				message: 'Class created successfully.',
				success: true
			});

			expect(test_course._id).toEqual('424242');
		});
	});

	describe('>renameCourse', () => {
		[null, undefined, ''].forEach(newCourseName => {
			it(`should not rename the course if the new course name is ${newCourseName}`, async () => {
				expect(createCourse).toBeDefined();

				const test_course = {
					_id: '424242',
					courseName: 'original_course_name',
					save: () => {}
				};

				const spy_findById = spyOn(Course, 'findById').and.returnValue(new Promise(done => done(undefined)));
				const spy_save = spyOn(test_course, 'save').and.returnValue(new Promise(() => undefined));
				const spy_emit = spyOn(mock_socket, 'emit').and.returnValue(undefined);

				expect(await renameCourse(mock_socket, '424242', newCourseName)).toEqual(undefined);

				expect(spy_findById.calls.count()).toEqual(0);

				expect(spy_save.calls.count()).toEqual(0);

				expect(spy_emit.calls.count()).toEqual(1);
				expect(spy_emit.calls.argsFor(0).length).toEqual(2);
				expect(spy_emit.calls.argsFor(0)[0]).toEqual('Response_RenameCourse');
				expect(spy_emit.calls.argsFor(0)[1]).toEqual({
					success: false,
					message: 'Class not renamed: Name must not be blank!'
				});

				expect(test_course._id).toEqual('424242');
				expect(test_course.courseName).toEqual('original_course_name');
			});
		});
	});
});
