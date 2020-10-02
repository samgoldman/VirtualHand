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

        describe('>handleResponseRetrieveHallPassRequests', () => {
            it('should be defined', () => {
                expect(handleResponseRetrieveHallPassRequests).toBeDefined();
            });

            it('should clear the divs and not add or grant anything if the number of requests is zero', () => {
                const mock_element = {
                    innerHTML: ''
                };

                const spy_clearHallPassDivs = spyOn(window, 'clearHallPassDivs').and.stub();
                const spy_countGranted = spyOn(window, 'countGranted').and.returnValue(3); // This would never happen with 0 requests, but test edge case just in case
                const spy_stopwatch_format = spyOn(window, 'stopwatch_format').and.returnValue('dummy_value');
                const spy_listItemTemplate = jasmine.createSpy('listItemTemplate').and.returnValue('dummy_value2');
                window.listItemTemplate = spy_listItemTemplate;
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(handleResponseRetrieveHallPassRequests({requests: []})).toBeUndefined();

                expect(spy_clearHallPassDivs.calls.count()).toEqual(1);
                expect(spy_clearHallPassDivs.calls.argsFor(0)).toEqual([]);

                expect(spy_countGranted.calls.count()).toEqual(1);
                expect(spy_countGranted.calls.argsFor(0)).toEqual([[]]); // Called with empty list

                expect(spy_stopwatch_format.calls.count()).toEqual(0);
                
                expect(spy_listItemTemplate.calls.count()).toEqual(0);
                
                expect(spy_querySelector.calls.count()).toEqual(0);
            });
        });
    });
});