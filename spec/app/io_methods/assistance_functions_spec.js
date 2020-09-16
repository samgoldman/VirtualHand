const AssistanceRequest = require('../../../app/models/assistanceRequest').model;
const {sendAssistanceRequestStatus, teacherResolveAssistanceRequest, initiateAssistanceRequest} = require('../../../app/io_methods/assistance_functions');
const io_broadcaster = require('../../../app/io_broadcaster');

describe('assistance_functions', () => {
    describe('>sendAssistanceRequestStatus', () => {
        it('should be defined', () => {
            expect(sendAssistanceRequestStatus).toBeDefined();
        });

        [{count: 1, expected: true}, {count: 0, expected: false}].forEach(testCase => {
            it(`should respond with status of ${testCase.expected} if the count of documents is ${testCase.count}`, async () => {
                const mock_socket = {
                    emit: () => undefined
                };

                const spy_countDocuments = spyOn(AssistanceRequest, 'countDocuments').and.returnValue(testCase.count);
                const spy_emit = spyOn(mock_socket, 'emit').and.returnValue(undefined);

                expect(await sendAssistanceRequestStatus(mock_socket, 'uid_1', 'cid_1')).toBeUndefined();

                expect(spy_countDocuments.calls.count()).toEqual(1);
                expect(spy_countDocuments.calls.argsFor(0)).toEqual([{
                    course: 'cid_1', student: 'uid_1', resolved: false
                }]);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Response_AssistanceRequestStatus', {status: testCase.expected}]);
            });
        });
    });

    describe('>teacherResolveAssistanceRequest', () => {
        it('should be defined', () => {
            expect(teacherResolveAssistanceRequest).toBeDefined()
        });

        it('should find and resolve the assistance request', async () => {
            const mock_documentQuery = {
                update: () => new Promise(done => done(undefined))
            };

            const spy_findById = spyOn(AssistanceRequest, 'findById').and.returnValue(mock_documentQuery);
            const spy_update = spyOn(mock_documentQuery, 'update').and.callThrough();
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);
            const spy_now = spyOn(Date, 'now').and.returnValue('res_time');

            expect(await teacherResolveAssistanceRequest('test_ar_id')).toEqual(undefined);

            expect(spy_findById.calls.count()).toEqual(1);
            expect(spy_findById.calls.argsFor(0)).toEqual(['test_ar_id']);

            expect(spy_update.calls.count()).toEqual(1);
            expect(spy_update.calls.argsFor(0)).toEqual([{resolved: true, resolved_type: 'teacher', resolvedTime: 'res_time'}]);

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0)).toEqual(['Broadcast_AssistanceRequestModified', null]);

            expect(spy_now.calls.count()).toEqual(1);
            expect(spy_now.calls.argsFor(0)).toEqual([]);
        });
    });

    describe('>initiateAssistanceRequest', () => {
        it('should be defined', () => {
            expect(initiateAssistanceRequest).toBeDefined();
        });

        it('should create a new assistance request and broadcast the change notification if one does not already exist', async () => {
            const spy_findOne = spyOn(AssistanceRequest, 'findOne').and.returnValue(new Promise(done => done(undefined)));
            const spy_create = spyOn(AssistanceRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);

            expect(await initiateAssistanceRequest('test_uid', 'test_cid')).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{student: 'test_uid', course: 'test_cid', resolved: false}]);

            expect(spy_create.calls.count()).toEqual(1);
            expect(spy_create.calls.argsFor(0)).toEqual([{student: 'test_uid', course: 'test_cid', resolved: false}]);

            expect(spy_broadcastGlobally.calls.count()).toEqual(1);
            expect(spy_broadcastGlobally.calls.argsFor(0)).toEqual(['Broadcast_AssistanceRequestModified', null]);
        });

        it('should do nothing if an unresolved request already exists', async () => {
            const spy_findOne = spyOn(AssistanceRequest, 'findOne').and.returnValue(new Promise(done => done('some_value')));
            const spy_create = spyOn(AssistanceRequest, 'create').and.returnValue(new Promise(done => done(undefined)));
            const spy_broadcastGlobally = spyOn(io_broadcaster, 'broadcastGlobally').and.returnValue(undefined);

            expect(await initiateAssistanceRequest('test_uid', 'test_cid')).toBeUndefined();

            expect(spy_findOne.calls.count()).toEqual(1);
            expect(spy_findOne.calls.argsFor(0)).toEqual([{student: 'test_uid', course: 'test_cid', resolved: false}]);

            expect(spy_create.calls.count()).toEqual(0);

            expect(spy_broadcastGlobally.calls.count()).toEqual(0);
        });
    });
});