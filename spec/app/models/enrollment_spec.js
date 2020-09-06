const Enrollment = require('../../../app/models/enrollment').model;

describe('enrollment', () => {
	describe('>pre validate hook', () => {
		it('should update the timestamp when the enrollment is updated', async () => {
			const enrollment = Enrollment({valid: false});

			expect(enrollment.timestamp).toBeDefined();

			const original_timestamp = enrollment.timestamp;

            while(new Date() <= original_timestamp) {}

			await enrollment.validate();

			expect(enrollment.timestamp).toBeGreaterThan(original_timestamp);
		});
	});

	describe('>getEnrolled', () => {
		it('should find all enrollments for the student that are valid and sort them by the course name', () => {
			expect(Enrollment.getEnrolled).toBeDefined();

			const returnValue = [{'_id': 0}, {'_id': 1}];

			const mock_document_query = {
				populate: () => mock_document_query,
				sort: (fn) => returnValue
			};

			const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_document_query);
			const spy_populate = spyOn(mock_document_query, 'populate').and.callThrough();
			const spy_sort = spyOn(mock_document_query, 'sort').and.callThrough();

			expect(Enrollment.getEnrolled({_id: 'test_uid'})).toEqual(returnValue);

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({student: 'test_uid', valid: true});

			expect(spy_populate.calls.count()).toEqual(1);
			expect(spy_populate.calls.argsFor(0).length).toEqual(1);
			expect(spy_populate.calls.argsFor(0)[0]).toEqual('course');

			expect(spy_sort.calls.count()).toEqual(1);
			expect(spy_sort.calls.argsFor(0).length).toEqual(1);
			expect(spy_sort.calls.argsFor(0)[0]).toEqual('course.courseName');
		});
	});
});