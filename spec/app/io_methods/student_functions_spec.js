const User = require('../../../app/models/user').model;
const Enrollment = require('../../../app/models/enrollment').model;

const rewire = require('rewire');
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

        it('should create an enrollment and return a failure message if the user is a student', async () => {
            const spy_user_findOrCreate = spyOn(User, 'findOrCreate').and.returnValue(new Promise(done => done({role: 'student', _id: 'user_id'})));
            const spy_enrollment_findOrCreate = spyOn(Enrollment, 'findOrCreate').and.returnValue(new Promise(done => done(undefined)));

            expect(await student_functions.addStudent('test_user_2', 'test_pwd', 'course_id')).toEqual('test_user_2 successfully added to the class');

            expect(spy_user_findOrCreate.calls.count()).toEqual(1);
            expect(spy_user_findOrCreate.calls.argsFor(0)).toEqual(['test_user_2', 'test_pwd']);

            expect(spy_enrollment_findOrCreate.calls.count()).toEqual(1);
            expect(spy_enrollment_findOrCreate.calls.argsFor(0)).toEqual(['course_id', 'user_id', true])
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
});