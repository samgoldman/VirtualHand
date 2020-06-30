const Course = require('../../../app/models/course').model;
const randomstring = require('randomstring');

describe('course', () => {
	describe('>verifyCourseTaughtBy', () => {
		it('should throw an error if the course is not taught by the given user', async() => {
			expect(Course.verifyCourseTaughtBy).toBeDefined();

			const mock_document_query = {
				countDocuments: () => {
					return mock_document_query;
				},
				then: (fn) => {fn(0)}
			};

			const spy_find = spyOn(Course, 'find').and.returnValue(mock_document_query);
			const spy_countDocuments = spyOn(mock_document_query, 'countDocuments').and.callThrough();
			const spy_then = spyOn(mock_document_query, 'then').and.callThrough();

			expect(() => Course.verifyCourseTaughtBy('course-id', 'user-id')).toThrowError('Teacher does not teach class!');

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({_id: 'course-id', teacher: 'user-id', valid: true});

			expect(spy_countDocuments.calls.count()).toEqual(1);
			expect(spy_countDocuments.calls.argsFor(0).length).toEqual(0);

			expect(spy_then.calls.count()).toEqual(1);
			expect(spy_then.calls.argsFor(0).length).toEqual(1);
		});

		it('should resolve if the course is taught by the given user', async() => {
			expect(Course.verifyCourseTaughtBy).toBeDefined();

			const mock_document_query = {
				countDocuments: () => {
					return mock_document_query;
				},
				then: (fn) => {fn(1)}
			};

			const spy_find = spyOn(Course, 'find').and.returnValue(mock_document_query);
			const spy_countDocuments = spyOn(mock_document_query, 'countDocuments').and.callThrough();
			const spy_then = spyOn(mock_document_query, 'then').and.callThrough();

			expect(await Course.verifyCourseTaughtBy('course-id', 'user-id')).toEqual(undefined);

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({_id: 'course-id', teacher: 'user-id', valid: true});

			expect(spy_countDocuments.calls.count()).toEqual(1);
			expect(spy_countDocuments.calls.argsFor(0).length).toEqual(0);

			expect(spy_then.calls.count()).toEqual(1);
			expect(spy_then.calls.argsFor(0).length).toEqual(1);
		});
	});

	describe('>taughtBy', () => {
		it('should return a documentQuery of sorted classes', async () => {
			expect(Course.taughtBy).toBeDefined();

			const mock_document_query = {
				sort: () => {
					return mock_document_query;
				}
			};

			const spy_find = spyOn(Course, 'find').and.returnValue(mock_document_query);
			const spy_sort = spyOn(mock_document_query, 'sort').and.callThrough();

			expect(await Course.taughtBy('user-id')).toEqual(mock_document_query);

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({teacher: 'user-id', valid: true});

			expect(spy_sort.calls.count()).toEqual(1);
			expect(spy_sort.calls.argsFor(0).length).toEqual(1);
			expect(spy_sort.calls.argsFor(0)[0]).toEqual('courseName');
		});
	});

	describe('>generateCourseKey', () => {
		it('should call generate with a parameter of 6 and return the value', () => {
			expect(Course.generateCourseKey).toBeDefined();

			const spy_generate = spyOn(randomstring, 'generate').and.returnValue('abc123');

			expect(Course.generateCourseKey()).toEqual('abc123');

			expect(spy_generate.calls.count()).toEqual(1);
			expect(spy_generate.calls.argsFor(0).length).toEqual(1);
			expect(spy_generate.calls.argsFor(0)[0]).toEqual(6);
		});
	});
});
