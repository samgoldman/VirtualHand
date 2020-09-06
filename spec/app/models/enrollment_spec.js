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

		describe('>findOrCreate', () => {
			it('should search by course id and user id and if there is a match, return it', () => {
				expect(Enrollment.findOrCreate).toBeDefined();

				const returnValue = {'student': 'sid', 'course': 'cid'};

				const mock_document_query = {
					then: fn => fn(returnValue)
				};
	
				const spy_findOne = spyOn(Enrollment, 'findOne').and.returnValue(mock_document_query)
				const spy_then = spyOn(mock_document_query, 'then').and.callThrough();
				const spy_create = spyOn(Enrollment, 'create').and.returnValue(undefined);
	
				expect(Enrollment.findOrCreate('cid', 'sid', false)).toEqual(returnValue);
	
				expect(spy_findOne.calls.count()).toEqual(1);
				expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
				expect(spy_findOne.calls.argsFor(0)[0]).toEqual({course: 'cid', student: 'sid', valid: true});
	
				expect(spy_then.calls.count()).toEqual(1);
				expect(spy_then.calls.argsFor(0).length).toEqual(1);
	
				expect(spy_create.calls.count()).toEqual(0);
			});
	
			it('should search by course id and user id and if there is no match, create a new enrollment with the admitted flag set to false if the parameter is false', () => {
				expect(Enrollment.findOrCreate).toBeDefined();
	
				const returnValue = {'student': 'sid2', 'course': 'cid2'};

				const mock_document_query = {
					then: fn => fn(undefined)
				};

				const spy_findOne = spyOn(Enrollment, 'findOne').and.returnValue(mock_document_query)
				const spy_then = spyOn(mock_document_query, 'then').and.callThrough();
				const spy_create = spyOn(Enrollment, 'create').and.returnValue(returnValue);
	
				expect(Enrollment.findOrCreate('cid2', 'sid2', false)).toEqual(returnValue);
	
				expect(spy_findOne.calls.count()).toEqual(1);
				expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
				expect(spy_findOne.calls.argsFor(0)[0]).toEqual({course: 'cid2', student: 'sid2', valid: true});
	
				expect(spy_then.calls.count()).toEqual(1);
				expect(spy_then.calls.argsFor(0).length).toEqual(1);
	
				expect(spy_create.calls.count()).toEqual(1);
				expect(spy_create.calls.argsFor(0).length).toEqual(1);
				expect(spy_create.calls.argsFor(0)[0]).toEqual({course: 'cid2', student: 'sid2', admitted: false});
			});
	
			it('should search by course id and user id and if there is no match, create a new enrollment with the admitted flag set to true if the parameter is true', () => {
				expect(Enrollment.findOrCreate).toBeDefined();
	
				const returnValue = {'student': 'sid2', 'course': 'cid2'};

				const mock_document_query = {
					then: fn => fn(undefined)
				};

				const spy_findOne = spyOn(Enrollment, 'findOne').and.returnValue(mock_document_query)
				const spy_then = spyOn(mock_document_query, 'then').and.callThrough();
				const spy_create = spyOn(Enrollment, 'create').and.returnValue(returnValue);
	
				expect(Enrollment.findOrCreate('cid2', 'sid2', true)).toEqual(returnValue);
	
				expect(spy_findOne.calls.count()).toEqual(1);
				expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
				expect(spy_findOne.calls.argsFor(0)[0]).toEqual({course: 'cid2', student: 'sid2', valid: true});
	
				expect(spy_then.calls.count()).toEqual(1);
				expect(spy_then.calls.argsFor(0).length).toEqual(1);
	
				expect(spy_create.calls.count()).toEqual(1);
				expect(spy_create.calls.argsFor(0).length).toEqual(1);
				expect(spy_create.calls.argsFor(0)[0]).toEqual({course: 'cid2', student: 'sid2', admitted: true});
			});
		});
	});

	describe('>confirmStudentInClass', () => {
		it('should throw an error if there is not a valid enrollment linking the student and the class', async() => {
			expect(Enrollment.confirmStudentInClass).toBeDefined();

			const mock_document_query = {
				countDocuments: () => {
					return mock_document_query;
				},
				then: fn => fn(0)
			};

			const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_document_query);
			const spy_countDocuments = spyOn(mock_document_query, 'countDocuments').and.callThrough();
			const spy_then = spyOn(mock_document_query, 'then').and.callThrough();

			expect(() => Enrollment.confirmStudentInClass('user-id', 'course-id')).toThrowError('Student not in class!');

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({course: 'course-id', student: 'user-id', valid: true});

			expect(spy_countDocuments.calls.count()).toEqual(1);
			expect(spy_countDocuments.calls.argsFor(0).length).toEqual(0);

			expect(spy_then.calls.count()).toEqual(1);
			expect(spy_then.calls.argsFor(0).length).toEqual(1);
		});

		it('should resolve if there is a valid enrollment linking the student and the class', async() => {
			expect(Enrollment.confirmStudentInClass).toBeDefined();

			const mock_document_query = {
				countDocuments: () => {
					return mock_document_query;
				},
				then: fn => fn(1)
			};

			const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_document_query);
			const spy_countDocuments = spyOn(mock_document_query, 'countDocuments').and.callThrough();
			const spy_then = spyOn(mock_document_query, 'then').and.callThrough();

			expect(await Enrollment.confirmStudentInClass('user-id2', 'course-id2')).toEqual(undefined);

			expect(spy_find.calls.count()).toEqual(1);
			expect(spy_find.calls.argsFor(0).length).toEqual(1);
			expect(spy_find.calls.argsFor(0)[0]).toEqual({course: 'course-id2', student: 'user-id2', valid: true});

			expect(spy_countDocuments.calls.count()).toEqual(1);
			expect(spy_countDocuments.calls.argsFor(0).length).toEqual(0);

			expect(spy_then.calls.count()).toEqual(1);
			expect(spy_then.calls.argsFor(0).length).toEqual(1);
		});
	});
});