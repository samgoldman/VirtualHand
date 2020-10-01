define((require) => {

    describe('assistance_request_list_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/assistance_request_list_module');
        });

        describe('>RetrieveAssistanceRequests', () => {
            it('should be defined', () => {
                expect(RetrieveAssistanceRequests).toBeDefined();
            });

            [[], ['a'], ['a', 'b', 'random_course_id_42']].forEach(selectedCourseList => {
                it(`should request assistance requests for selected courses (${selectedCourseList})`, () => {
                    const mock_socket = {
                        emit: () => undefined
                    };
                    socket = mock_socket;

                    const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                    const spy_getSelectedClassIds = jasmine.createSpy('getSelectedClassIds').and.returnValue(selectedCourseList);
                    const original_getSelectedClassIds = getSelectedClassIds;
                    getSelectedClassIds = spy_getSelectedClassIds;

                    expect(RetrieveAssistanceRequests()).toBeUndefined();

                    expect(spy_emit.calls.count()).toEqual(1);
                    expect(spy_emit.calls.argsFor(0)).toEqual(['Request_RetrieveAssistanceRequests', {cids: selectedCourseList, qty: 5}]);

                    expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                    expect(spy_getSelectedClassIds.calls.argsFor(0)).toEqual([]);
                    
                    getSelectedClassIds = original_getSelectedClassIds;
                });
            });
        });

        describe('>AssistanceRequestListModuleInit', () => {
            it('should be defined', () => {
                expect(AssistanceRequestListModuleInit).toBeDefined();
            });

            it('should setup event listeners and socket.io handlers', () => {
                const mock_socket = {
                    on: () => undefined
                };

                const mock_jquery_result = {
                    change: () => undefined,
                    click: () => undefined
                };

                socket = mock_socket;

                const spy_on = spyOn(mock_socket, 'on').and.callThrough();
                const spy_addEventListener = spyOn(document.body, 'addEventListener').and.returnValue(undefined);
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_change = spyOn(mock_jquery_result, 'change').and.callThrough();
                const spy_click = spyOn(mock_jquery_result, 'click').and.callThrough();
                const spy_RetrieveAssistanceRequests = spyOn(window, 'RetrieveAssistanceRequests').and.returnValue(undefined);

                expect(AssistanceRequestListModuleInit()).toBeUndefined();

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['keyup', KeyDownHandler]);

                expect(spy_on.calls.count()).toEqual(2);
                expect(spy_on.calls.argsFor(0)).toEqual(['Broadcast_AssistanceRequestModified', RetrieveAssistanceRequests]);
                expect(spy_on.calls.argsFor(1)).toEqual(['Response_RetrieveAssistanceRequests', HandleRetrieveAssistanceRequests]);

                expect(spy_jquery.calls.count()).toEqual(2);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['#class_selector']);
                expect(spy_jquery.calls.argsFor(1)).toEqual(['#clear-all-ar']);
                
                expect(spy_change.calls.count()).toEqual(1);
                expect(spy_change.calls.argsFor(0)).toEqual([RetrieveAssistanceRequests]);

                expect(spy_click.calls.count()).toEqual(1);
                expect(spy_click.calls.argsFor(0)).toEqual([ClearAllAssistanceRequests]);

                expect(spy_RetrieveAssistanceRequests.calls.count()).toEqual(1);
                expect(spy_RetrieveAssistanceRequests.calls.argsFor(0).length).toEqual(0);
                
            });
        });

        describe('>ClearAllAssistanceRequests', () => {
            it('should be defined', () => {
                expect(ClearAllAssistanceRequests).toBeDefined();
            });

            [[], ['a'], ['a', 'b', 'random_course_id_42']].forEach(selectedCourseList => {
                it(`should request assistance requests for selected courses (${selectedCourseList})`, () => {
                    const mock_socket = {
                        emit: () => undefined
                    };
                    socket = mock_socket;

                    const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                    const spy_getSelectedClassIds = jasmine.createSpy('getSelectedClassIds').and.returnValue(selectedCourseList);
                    const original_getSelectedClassIds = getSelectedClassIds;
                    getSelectedClassIds = spy_getSelectedClassIds;

                    expect(ClearAllAssistanceRequests()).toBeUndefined();

                    expect(spy_emit.calls.count()).toEqual(selectedCourseList.length);
                    for(let i = 0; i < selectedCourseList.length; i++)
                        expect(spy_emit.calls.argsFor(i)).toEqual(['Request_TeacherResolveAllAssistanceRequests', {cid: selectedCourseList[i]}]);

                    expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                    expect(spy_getSelectedClassIds.calls.argsFor(0)).toEqual([]);

                    getSelectedClassIds = original_getSelectedClassIds;
                });
            });
        });

        describe('>KeyDownHandler', () => {
            it('should be defined', () => {
                expect(KeyDownHandler).toBeDefined();
            });

            [{event: new KeyboardEvent('keydown', {keyCode: 49, which: 49, key: '1'}), window_event: undefined, expected: 0},
             {event: new KeyboardEvent('keydown', {keyCode: 50, which: 50, key: '2'}), window_event: undefined, expected: 1},
             {event: new KeyboardEvent('keydown', {keyCode: 51, which: 51, key: '3'}), window_event: undefined, expected: 2},
             {event: new KeyboardEvent('keydown', {keyCode: 52, which: 52, key: '4'}), window_event: undefined, expected: 3},
             {event: new KeyboardEvent('keydown', {keyCode: 53, which: 53, key: '5'}), window_event: undefined, expected: 4},
             {event: new KeyboardEvent('keydown', {keyCode: 49, which: 49, key: '1'}), window_event: true, expected: 0},
             {event: new KeyboardEvent('keydown', {keyCode: 50, which: 50, key: '2'}), window_event: true, expected: 1},
             {event: new KeyboardEvent('keydown', {keyCode: 51, which: 51, key: '3'}), window_event: true, expected: 2},
             {event: new KeyboardEvent('keydown', {keyCode: 52, which: 52, key: '4'}), window_event: true, expected: 3},
             {event: new KeyboardEvent('keydown', {keyCode: 53, which: 53, key: '5'}), window_event: true, expected: 4}].forEach(testCase => {
                const {event, window_event, expected} = testCase;
                it('should call handDown with the value of the key minus 1 if it is an integer', () => {
                    const spy_handDown = jasmine.createSpy('handDown').and.stub();
                    const spy_RequestRandomStudent = jasmine.createSpy('RequestRandomStudent').and.stub();
                    const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.stub();

                    const original_handDown = handDown;
                    const original_RequestRandomStudent = undefined;
                    const original_window_event = window.window_event;

                    handDown = spy_handDown;
                    RequestRandomStudent = spy_RequestRandomStudent;

                    expect(KeyDownHandler(event)).toBeUndefined();

                    expect(spy_handDown.calls.count()).toEqual(1);
                    expect(spy_handDown.calls.argsFor(0)).toEqual([expected]);

                    expect(spy_RequestRandomStudent.calls.count()).toEqual(0);

                    expect(spy_getSelectedClassId.calls.count()).toEqual(0);

                    handDown = original_handDown;
                    RequestRandomStudent = original_RequestRandomStudent;
                    window.event = original_window_event;
                });
            });

            it('should call RequestRandomStudent for the selected class if the key is r', () => {
                const spy_handDown = jasmine.createSpy('handDown').and.stub();
                const spy_RequestRandomStudent = jasmine.createSpy('RequestRandomStudent').and.stub();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('42');

                const original_handDown = handDown;
                const original_RequestRandomStudent = undefined;

                handDown = spy_handDown;
                RequestRandomStudent = spy_RequestRandomStudent;

                expect(KeyDownHandler(new KeyboardEvent('keydown', {keyCode: 114}))).toBeUndefined();

                expect(spy_handDown.calls.count()).toEqual(0);

                expect(spy_RequestRandomStudent.calls.count()).toEqual(1);
                expect(spy_RequestRandomStudent.calls.argsFor(0)).toEqual(['42'])

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                handDown = original_handDown;
                RequestRandomStudent = original_RequestRandomStudent;
            });
        });
    });
});