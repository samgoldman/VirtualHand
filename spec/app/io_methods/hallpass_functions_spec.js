const HallPassRequest = require('../../../app/models/hallPassRequest').model;
const Enrollment = require('../../../app/models/enrollment').model;
const {sendHallPassRequestStatus, studentResolveHallPassRequest, initiateHallPassRequest, teacherResolveHallPassRequest, teacherGrantHallPassRequest} = require('../../../app/io_methods/hallpass_functions');
const io_broadcaster = require('../../../app/io_broadcaster');

const mock_socket = {
	emit: () => {}
};

describe('Hallpass Functions', () => {
    describe('>sendHallPassRequestStatus', () => {
        [undefined, {'_id': 'test_request'}, {'student': 'test_uid', course: 'test_couse'}].forEach(expectedEmit => {
            it(`should look for an unresolved hallpass request and emit the result (${expectedEmit}) to the calling socket`, async () => {
                expect(sendHallPassRequestStatus).toBeDefined();

                const mock_documentQuery = {
                    exec: () => new Promise((done) => done(expectedEmit))
                }

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(mock_documentQuery);
                const spy_exec = spyOn(mock_documentQuery, 'exec').and.callThrough();

                expect(await sendHallPassRequestStatus(mock_socket, 'test_uid', 'test_cid')).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0).length).toEqual(2);
                expect(spy_emit.calls.argsFor(0)[0]).toEqual('Response_HallPassRequestStatus');
                expect(spy_emit.calls.argsFor(0)[1]).toEqual({request: expectedEmit});

                expect(spy_findOne.calls.count()).toEqual(1);
                expect(spy_findOne.calls.argsFor(0)).toEqual([{course: 'test_cid', student: 'test_uid', resolved: false}]);

                expect(spy_exec.calls.count()).toEqual(1);
                expect(spy_exec.calls.argsFor(0)).toEqual([]);
            });
        });
    });

    describe('>studentResolveHallPassRequest', () => {
        it('should find and update matching hall pass requests to resolved-by-student state and send a global notification about the update if there was no error in the update', async () => {
            expect(studentResolveHallPassRequest).toBeDefined();

            const mock_documentQuery = {
                updateMany: () => new Promise((done) => done("random_value"))
            };

            const spy_find = spyOn(HallPassRequest, 'find').and.returnValue(mock_documentQuery);
            const spy_updateMany = spyOn(mock_documentQuery, 'updateMany').and.callThrough();
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('date_value_here');

            expect(await studentResolveHallPassRequest('student_id', 'course_id')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0).length).toEqual(1);
            expect(spy_find.calls.argsFor(0)[0]).toEqual({student: 'student_id', course: 'course_id', resolved: false});

            expect(spy_updateMany.calls.count()).toEqual(1);
            expect(spy_updateMany.calls.argsFor(0).length).toEqual(1);
            expect(spy_updateMany.calls.argsFor(0)[0]).toEqual({resolved: true, resolved_type: 'student', resolvedTime: 'date_value_here'});

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0).length).toEqual(2);
            expect(spy_broadcastGlobally.calls.argsFor(0)[0]).toEqual('Broadcast_HallPassRequestModified');
            expect(spy_broadcastGlobally.calls.argsFor(0)[1]).toEqual(null);

            expect(spy_log.calls.count()).toEqual(0);

            expect(spy_now.calls.count()).toEqual(1);
            expect(spy_now.calls.argsFor(0).length).toEqual(0);
        });

        it('should find and update matching hall pass requests to resolved-by-student state and log the error if there was an error in the find', async () => {
            expect(studentResolveHallPassRequest).toBeDefined();

            const mock_documentQuery = {
                updateMany: () => new Promise((done) => done("random_value_2"))
            };

            const spy_find = spyOn(HallPassRequest, 'find').and.callFake(() => {throw new Error('Error with find')})
            const spy_updateMany = spyOn(mock_documentQuery, 'updateMany').and.callThrough();
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('date_value_here_2');

            expect(await studentResolveHallPassRequest('student_id2', 'course_id2')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0).length).toEqual(1);
            expect(spy_find.calls.argsFor(0)[0]).toEqual({student: 'student_id2', course: 'course_id2', resolved: false});

            expect(spy_updateMany.calls.count()).toEqual(0);

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Error with find'));

            expect(spy_now.calls.count()).toEqual(0);
        });

        it('should find and update matching hall pass requests to resolved-by-student state and log the error if there was an error in the update', async () => {
            expect(studentResolveHallPassRequest).toBeDefined();

            const mock_documentQuery = {
                updateMany: () => {throw new Error('Error with update')}
            };

            const spy_find = spyOn(HallPassRequest, 'find').and.returnValue(mock_documentQuery);
            const spy_updateMany = spyOn(mock_documentQuery, 'updateMany').and.callThrough();
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('date_value_here3');

            expect(await studentResolveHallPassRequest('student_id3', 'course_id3')).toBeUndefined();

            expect(spy_find.calls.count()).toEqual(1);
            expect(spy_find.calls.argsFor(0).length).toEqual(1);
            expect(spy_find.calls.argsFor(0)[0]).toEqual({student: 'student_id3', course: 'course_id3', resolved: false});

            expect(spy_updateMany.calls.count()).toEqual(1);
            expect(spy_updateMany.calls.argsFor(0).length).toEqual(1);
            expect(spy_updateMany.calls.argsFor(0)[0]).toEqual({resolved: true, resolved_type: 'student', resolvedTime: 'date_value_here3'});

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Error with update'));

            expect(spy_now.calls.count()).toEqual(1);
            expect(spy_now.calls.argsFor(0).length).toEqual(0);
        });
    });

    describe('>initiateHallPassRequest', () => {
        it('should be defined', () => {
            expect(initiateHallPassRequest).toBeDefined();
        });

        it('should log the error is confirming the student is in the course results in an error', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(() => {throw new Error('Student not enrolled')}))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_1', course_id = 'course_id_1';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(0);

            expect(spy_create.calls.count()).toEqual(0);

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Student not enrolled'));
        });
        

        it('should do nothing if the query for an existing request is defined and not null', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done('defined_and_not_null')));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_2', course_id = 'course_id_2';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(0);

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(0);
        });
        
        it('should create a new request and broadcast globally if existing request is undefined', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_3', course_id = 'course_id_3';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0).length).toEqual(1);
            expect(spy_create.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false, granted: false});

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0).length).toEqual(2);
            expect(spy_broadcastGlobally.calls.argsFor(0)[0]).toEqual('Broadcast_HallPassRequestModified');
            expect(spy_broadcastGlobally.calls.argsFor(0)[1]).toEqual(null);

            expect(spy_log.calls.count()).toEqual(0);
        });
        
        it('should create a new request and broadcast globally if existing request is undefined', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done(null)));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_4', course_id = 'course_id_4';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0).length).toEqual(1);
            expect(spy_create.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false, granted: false});

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0).length).toEqual(2);
            expect(spy_broadcastGlobally.calls.argsFor(0)[0]).toEqual('Broadcast_HallPassRequestModified');
            expect(spy_broadcastGlobally.calls.argsFor(0)[1]).toEqual(null);

            expect(spy_log.calls.count()).toEqual(0);
        });

        it('should log the error if the creation attempt results in an error', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => {throw new Error('Creation error')}));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_5', course_id = 'course_id_5';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0).length).toEqual(1);
            expect(spy_create.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false, granted: false});

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Creation error'));
        });

        it('should log the error if the broadcast results in an error', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.throwError(new Error('Broadcast error'));
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_6', course_id = 'course_id_6';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0).length).toEqual(1);
            expect(spy_create.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false, granted: false});

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0).length).toEqual(2);
            expect(spy_broadcastGlobally.calls.argsFor(0)[0]).toEqual('Broadcast_HallPassRequestModified');
            expect(spy_broadcastGlobally.calls.argsFor(0)[1]).toEqual(null);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Broadcast error'));
        });

        it('should log the error if the search for an existing request results in an error', async () => {
            const spy_confirmStudentInClass = spyOn(Enrollment, 'confirmStudentInClass').and.returnValue(new Promise(done => done(undefined)))
            const spy_findOne = spyOn(HallPassRequest, 'findOne').and.returnValue(new Promise(done => {throw new Error('Search error')}));
            const spy_create = spyOn(HallPassRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_log = spyOn(console, 'log').and.returnValue(undefined);

            const student_id = 'student_id_6', course_id = 'course_id_6';

            expect(await initiateHallPassRequest(student_id, course_id)).toBeUndefined();

            expect(spy_confirmStudentInClass.calls.count()).toEqual(1);
            expect(spy_confirmStudentInClass.calls.argsFor(0).length).toEqual(2);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[0]).toEqual(student_id);
            expect(spy_confirmStudentInClass.calls.argsFor(0)[1]).toEqual(course_id);

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0).length).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)[0]).toEqual({student: student_id, course: course_id, resolved: false});

            expect(spy_create.calls.count()).toEqual(0);

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);

            expect(spy_log.calls.count()).toEqual(1);
            expect(spy_log.calls.argsFor(0).length).toEqual(1);
            expect(spy_log.calls.argsFor(0)[0]).toEqual(new Error('Search error'));
        });

    });;

    describe('>teacherResolveHallPassRequest', () => {
        it('should be defined', () => {
            expect(teacherResolveHallPassRequest).toBeDefined()
        });

        it('should find and resolve the hallpass request', async () => {
            const mock_documentQuery = {
                updateOne: () => new Promise(done => done(undefined))
            };

            const spy_findById = spyOn(HallPassRequest, 'findById').and.returnValue(mock_documentQuery);
            const spy_updateOne = spyOn(mock_documentQuery, 'updateOne').and.callThrough();
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('res_time');

            expect(await teacherResolveHallPassRequest('test_ar_id')).toEqual(undefined);

            expect(spy_findById.calls.count()).toEqual(1);
            expect(spy_findById.calls.argsFor(0)).toEqual(['test_ar_id']);

            expect(spy_updateOne.calls.count()).toEqual(1);
            expect(spy_updateOne.calls.argsFor(0)).toEqual([{resolved: true, resolved_type: 'teacher', resolvedTime: 'res_time'}]);

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0)).toEqual(['Broadcast_HallPassRequestModified', null]);

            expect(spy_now.calls.count()).toEqual(1);
            expect(spy_now.calls.argsFor(0)).toEqual([]);
        });
    });

    describe('>teacherGrantHallPassRequest', () => {
        it('should be defined', () => {
            expect(teacherGrantHallPassRequest).toBeDefined()
        });

        it('should find and resolve the hallpass request', async () => {
            const mock_documentQuery = {
                updateOne: () => new Promise(done => done(undefined))
            };

            const spy_findById = spyOn(HallPassRequest, 'findById').and.returnValue(mock_documentQuery);
            const spy_updateOne = spyOn(mock_documentQuery, 'updateOne').and.callThrough();
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('res_time');

            expect(await teacherGrantHallPassRequest('test_ar_id')).toEqual(undefined);

            expect(spy_findById.calls.count()).toEqual(1);
            expect(spy_findById.calls.argsFor(0)).toEqual(['test_ar_id']);

            expect(spy_updateOne.calls.count()).toEqual(1);
            expect(spy_updateOne.calls.argsFor(0)).toEqual([{granted: true, grantedTime: 'res_time'}]);

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0)).toEqual(['Broadcast_HallPassRequestModified', null]);

            expect(spy_now.calls.count()).toEqual(1);
            expect(spy_now.calls.argsFor(0)).toEqual([]);
        });
    });
});