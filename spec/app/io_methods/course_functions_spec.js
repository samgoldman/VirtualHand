const Course = require('../../../app/models/course').model;
const User = require('../../../app/models/user').model;
const {createCourse} = require('../../../app/io_methods/course_functions');

const mock_socket = {
	emit: () => {}
}

describe('Course Functions', () => {
	describe('>createCourse', () => {
		[undefined, null].forEach(courseName => {
			it(`not change the course name if the course name is ${courseName}`, async () => {
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

		it('not change the course name if the user ID is invalid', async () => {
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

		it('not change the course name if the course name is undefined', async () => {
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
});
