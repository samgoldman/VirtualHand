const HallPassRequest = require('../../../app/models/hallPassRequest').model;
const {sendHallPassRequestStatus} = require('../../../app/io_methods/hallpass_functions');

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
});