const AssistanceRequest = require('../../../app/models/assistanceRequest').model;
const {sendAssistanceRequestStatus} = require('../../../app/io_methods/assistance_functions');

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
});