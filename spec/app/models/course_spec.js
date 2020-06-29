const Course = require('../../../app/models/course').model;

describe('course', () => {
	describe('>verifyCourseTaughtBy', () => {
		it('should throw an error if the course is not taught by the given user', async() => {
			expect(Course.verifyCourseTaughtBy).toBeDefined();

			const mock_document_query = {
				countDocuments: () => {
					return mock_document_query;
				},
				then: (fn) => {fn(0)}
			}

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
			}

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
});
