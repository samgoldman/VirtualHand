const User = require('../../../app/models/user').model;
const Enrollment = require('../../../app/models/enrollment').model;
const Course = require('../../../app/models/course').model;

const rewire = require('rewire');
const { sendStudentsForClass, admitStudent, removeStudent, enrollStudent, removeAllStudentsFromCourse } = require('../../../app/io_methods/student_functions');
const { model } = require('../../../app/models/user');
const student_functions = rewire('../../../app/io_methods/student_functions');

describe('student_functions', () => {
    describe('>addStudent', () => {
        it('should be defined', () => {
            expect(student_functions.addStudent).toBeDefined();
        });

        it('should return a failure message if the user exists and is not a student', async () => {
            const spy_user_findOrCreate = spyOn(User, 'findOrCreate').and.returnValue(new Promise(done => done({role: 'teacher'})));
            const spy_enrollment_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));
            
            expect(await student_functions.addStudent('test_user_1', 'test_pwd', 'course_id')).toEqual('test_user_1 is not a student and was not added to the class');

            expect(spy_user_findOrCreate.calls.count()).toEqual(1);
            expect(spy_user_findOrCreate.calls.argsFor(0)).toEqual(['test_user_1', 'test_pwd']);

            expect(spy_enrollment_findOrCreate.calls.count()).toEqual(0);
        });

        it('should create an enrollment and return a success message if the user is a student', async () => {
            const spy_user_findOrCreate = spyOn(User, 'findOrCreate').and.returnValue(new Promise(done => done({role: 'student', _id: 'user_id'})));
            const spy_enrollment_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));

            expect(await student_functions.addStudent('test_user_2', 'test_pwd', 'course_id')).toEqual('test_user_2 successfully added to the class');

            expect(spy_user_findOrCreate.calls.count()).toEqual(1);
            expect(spy_user_findOrCreate.calls.argsFor(0)).toEqual(['test_user_2', 'test_pwd']);

            expect(spy_enrollment_findOrCreate.calls.count()).toEqual(1);
            expect(spy_enrollment_findOrCreate.calls.argsFor(0)).toEqual(['course_id', 'user_id', true])
        });

        it('should set the role to student, create an enrollment and return a success message if the user has no role', async () => {
            const mock_user = {save: () => new Promise(done => done(undefined)), _id: 'user_id'};

            const spy_user_findOrCreate = spyOn(User, 'findOrCreate').and.returnValue(new Promise(done => done(mock_user)));
            const spy_enrollment_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));
            const spy_save = spyOn(mock_user, 'save').and.callThrough();

            expect(await student_functions.addStudent('test_user_2', 'test_pwd', 'course_id')).toEqual('test_user_2 successfully added to the class');

            expect(spy_user_findOrCreate.calls.count()).toEqual(1);
            expect(spy_user_findOrCreate.calls.argsFor(0)).toEqual(['test_user_2', 'test_pwd']);

            expect(spy_enrollment_findOrCreate.calls.count()).toEqual(1);
            expect(spy_enrollment_findOrCreate.calls.argsFor(0)).toEqual(['course_id', 'user_id', true])

            expect(spy_save.calls.count()).toEqual(1);
            expect(spy_save.calls.argsFor(0)).toEqual([]);

            expect(mock_user.role).toEqual('student');
        });
    });

    describe('>addStudents', () => {
        it('should be defined', () => {
            expect(student_functions.addStudents).toBeDefined();
        });

        ['', 's1', 's1,test1'].forEach(csvString => {
            it(`it should call addStudent for each username in the CSV string "${csvString}"`, async () => {
                const mock_socket = {
                    emit: () => undefined
                };

                const addStudent_original = student_functions.__get__('addStudent');

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                let callCount = 0;
                const spy_addStudent = jasmine.createSpy('addStudent').and.callFake(() => new Promise(done => done(`added ${callCount++}`)));
                student_functions.__set__('addStudent', spy_addStudent);

                expect(await student_functions.addStudents(mock_socket, 'course_id', csvString, 'pwd')).toBeUndefined();

                const csvSplit = csvString.split(',');
                expect(spy_addStudent.calls.count()).toEqual(csvSplit.length);
                for (let i = 0; i < csvSplit.length; i++)
                    expect(spy_addStudent.calls.argsFor(i)).toEqual([csvSplit[i], 'pwd', 'course_id'])

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Response_AddStudents', {
                    success:true,
                    message: [...Array(csvSplit.length).keys()].map(i => `added ${i}`).join('<br />')
                }]);

                student_functions.__set__('addStudent', addStudent_original);
            });
        });
    });

    describe('>getRandomStudent', () => {
        it('should be defined', () => {
            expect(student_functions.getRandomStudent).toBeDefined();
        });

        [{usernames: ['s1'], random: 0, expected: 's1'},
         {usernames: ['s1'], random: .99, expected: 's1'},
         {usernames: ['s1', 's2'], random: .15, expected: 's1'},
         {usernames: ['s1', 's2'], random: .5, expected: 's2'}].forEach(testCase => {
            const {usernames, random, expected} = testCase;
            it(`should respond with ${expected} when ${usernames} are enrolled and ${random} is the random value`, async () => {
                const enrollments = usernames.map(username => {
                    return {student: {username: username}}
                });

                const mock_documentQuery = {
                    populate: () => new Promise(done => done(enrollments))
                };

                const mock_socket = {
                    emit: () => undefined
                };

                const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);
                const spy_populate = spyOn(mock_documentQuery, 'populate').and.callThrough();
                const spy_random = spyOn(Math, 'random').and.returnValue(random);
                const spy_emit = spyOn(mock_socket, 'emit');

                expect(await student_functions.getRandomStudent(mock_socket, 'test_cid')).toBeUndefined();

                expect(spy_find.calls.count()).toEqual(1);
                expect(spy_find.calls.argsFor(0)).toEqual([{course: 'test_cid', valid: true, admitted: true}]);

                expect(spy_populate.calls.count()).toEqual(1);
                expect(spy_populate.calls.argsFor(0)).toEqual(['student']);

                expect(spy_random.calls.count()).toEqual(1);
                expect(spy_random.calls.argsFor(0)).toEqual([]);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Response_RandomStudent', {'randomStudentName': expected}]);
            });
         });
    });

    describe('>sendStudentsForClass', () => {
        it('should be defined', () => {
            expect(sendStudentsForClass).toBeDefined();
        });

        it('should find all enrollements and sort them by username', async () => {
            const mock_documentQuery = {
                populate: () => mock_documentQuery,
                sort: () => new Promise(done => done('student_values'))
            };

            const mock_socket = {
                emit: () => undefined
            };

            const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);
            const spy_sort = spyOn(mock_documentQuery, 'sort').and.callThrough();
            const spy_populate = spyOn(mock_documentQuery, 'populate').and.callThrough();
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

            expect(await sendStudentsForClass(mock_socket, 'test_cid')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0)).toEqual([{course: 'test_cid', valid: true}]);

            expect(spy_sort.calls.count()).toEqual(1);
            expect(spy_sort.calls.argsFor(0)).toEqual(['student.username']);

            expect(spy_populate.calls.count()).toEqual(1);
            expect(spy_populate.calls.argsFor(0)).toEqual(['student']);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_StudentsForClass', {enrollments: 'student_values'}]);
        });
    });

    describe('>admitStudent', () => {
        it('should be defined', () => {
            expect(admitStudent).toBeDefined();
        });

        it('should find and admit the student', async () => {
            const mock_documentQuery = {
                updateOne: () => new Promise(done => done(undefined))
            };

            const mock_socket = {
                emit: () => undefined
            };

            const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);
            const spy_updateOne = spyOn(mock_documentQuery, 'updateOne').and.callThrough();
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

            expect(await admitStudent(mock_socket, 'test_cid', 'test_uid')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0)).toEqual([{course: 'test_cid', student: 'test_uid', valid: true}]);

            expect(spy_updateOne.calls.count()).toEqual(1);
            expect(spy_updateOne.calls.argsFor(0)).toEqual([{admitted: true}]);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_AdmitStudent', {cid: 'test_cid', student: 'test_uid'}]);
        });
    });

    describe('>RemoveStudent', () => {
        it('should be defined', () => {
            expect(removeStudent).toBeDefined();
        });

        it('should find and remove the student', async () => {
            const mock_documentQuery = {
                updateOne: () => new Promise(done => done(undefined))
            };

            const mock_socket = {
                emit: () => undefined
            };

            const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);
            const spy_updateOne = spyOn(mock_documentQuery, 'updateOne').and.callThrough();
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

            expect(await removeStudent(mock_socket, 'test_cid', 'test_uid')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0)).toEqual([{course: 'test_cid', student: 'test_uid', valid: true}]);

            expect(spy_updateOne.calls.count()).toEqual(1);
            expect(spy_updateOne.calls.argsFor(0)).toEqual([{valid: false}]);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_RemoveStudent', {cid: 'test_cid', student: 'test_uid'}]);
        });
    });

    describe('>enrollStudent', () => {
        it('should be defined', () => {
            expect(enrollStudent).toBeDefined();
        });

        it('>should not enroll the student if no matching course is found', async () => {
            const mock_socket = {
                emit: () => undefined
            };

            const spy_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

            expect(await enrollStudent(mock_socket, 'test_student_id', 'course_key')).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{courseKey: 'course_key', valid: true}]);

            expect(spy_findOrCreate.calls.count()).toEqual(0);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_EnrollStudent', {success: false, message: 'Course key is invalid'}]);
        });

        it('>should enroll the student if a matching course is found', async () => {
            const mock_socket = {
                emit: () => undefined
            };

            const spy_findOne = spyOn(Course, 'findOne').and.returnValue(new Promise(done => done({_id: 'course_id'})));
            const spy_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

            expect(await enrollStudent(mock_socket, 'test_student_id', 'course_key_2')).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{courseKey: 'course_key_2', valid: true}]);

            expect(spy_findOrCreate.calls.count()).toEqual(1);
            expect(spy_findOrCreate.calls.argsFor(0)).toEqual(['course_id', 'test_student_id', false]);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_EnrollStudent', {success: true, message: 'Enrolled successfully: your teacher must now admit you into the class.'}]);
        });
    });

    describe('>removeAllStudentsFromCourse', () => {
        it('should be defined', () => {
            expect(removeAllStudentsFromCourse).toBeDefined();
        });

        it('should not remove students if the course is not taught by the user', async () => {
            const mock_socket = {
                emit: () => undefined
            };

            const mock_documentQuery = {
                updateMany: () => new Promise(done => done(undefined))
            };

            const spy_verifyCourseTaughtBy = spyOn(Course, 'verifyCourseTaughtBy').and.throwError('error_message_not_taught');
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
            const spy_updateMany = spyOn(mock_documentQuery, 'updateMany').and.callThrough();
            const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);

            expect(await removeAllStudentsFromCourse(mock_socket, 'test_uid', 'test_cid')).toBeUndefined();

            expect(spy_verifyCourseTaughtBy.calls.count()).toEqual(1);
            expect(spy_verifyCourseTaughtBy.calls.argsFor(0)).toEqual(['test_cid', 'test_uid']);

            expect(spy_find.calls.count()).toEqual(0);

            expect(spy_updateMany.calls.count()).toEqual(0);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_RemoveAllStudents', {success: false, message: 'error_message_not_taught'}]);
        });

        it('should remove all students if the course is taught by the user', async () => {
            const mock_socket = {
                emit: () => undefined
            };

            const mock_documentQuery = {
                updateMany: () => new Promise(done => done(undefined))
            };

            const spy_verifyCourseTaughtBy = spyOn(Course, 'verifyCourseTaughtBy').and.returnValue(new Promise(done => done(undefined)));
            const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
            const spy_updateMany = spyOn(mock_documentQuery, 'updateMany').and.callThrough();
            const spy_find = spyOn(Enrollment, 'find').and.returnValue(mock_documentQuery);

            expect(await removeAllStudentsFromCourse(mock_socket, 'test_uid', 'test_cid')).toBeUndefined();

            expect(spy_verifyCourseTaughtBy.calls.count()).toEqual(1);
            expect(spy_verifyCourseTaughtBy.calls.argsFor(0)).toEqual(['test_cid', 'test_uid']);

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0)).toEqual([{course: 'test_cid', valid: true}]);

            expect(spy_updateMany.calls.count()).toEqual(1);
            expect(spy_updateMany.calls.argsFor(0)).toEqual([{valid: false}]);

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0)).toEqual(['Response_RemoveAllStudents', {success: true, message: 'Successfully removed all students'}]);
        });
    });
});