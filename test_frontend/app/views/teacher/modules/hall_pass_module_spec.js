define((require) => {

    describe('hall_pass_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/hall_pass_module');
        });

        describe('>countGranted', () => {
            it('should be defined', () => {
                expect(countGranted).toBeDefined();
            });

            [{requests: [], expected: 0},
             {requests: [{granted: false}], expected: 0},
             {requests: [{granted: true}], expected: 1},
             {requests: [{granted: false}, {granted: false}], expected: 0},
             {requests: [{granted: false}, {granted: true}], expected: 1},
             {requests: [{granted: true}, {granted: true}], expected: 2}
            ].forEach(testCase => {
                const {requests, expected} = testCase;
                it(`should return the count of granted requests (Expected: ${expected})`, () => {
                    expect(countGranted(requests)).toEqual(expected);
                });
            })
        });

        describe('>resolvePass', () => {
            it('should be defined', () => {
                expect(resolvePass).toBeDefined();
            });

            it('should send a request to the server with the provided id', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.stub();

                expect(resolvePass('test_hall_pass_id_24')).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_TeacherResolveHallPassRequest', {hrid: 'test_hall_pass_id_24'}]);
            });
        })

        describe('>grantPass', () => {
            it('should be defined', () => {
                expect(grantPass).toBeDefined();
            });

            it('should send a request to the server with the provided id', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.stub();

                expect(grantPass('test_hall_pass_id_123')).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_TeacherGrantHallPassRequest', {hrid: 'test_hall_pass_id_123'}]);
            });
        })

        describe('>RetrieveHallPassRequests', () => {
            it('should be defined', () => {
                expect(RetrieveHallPassRequests).toBeDefined();
            });

            it('should send a request to the server with the provided id', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.stub();
                const spy_getSelectedClassIds = spyOn(window, 'getSelectedClassIds').and.returnValue(['a', '1', 'b']);

                expect(RetrieveHallPassRequests()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_RetrieveHallPassRequests', {cids: ['a', '1', 'b']}]);

                expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                expect(spy_getSelectedClassIds.calls.argsFor(0)).toEqual([]);
            });
        });
    });
});