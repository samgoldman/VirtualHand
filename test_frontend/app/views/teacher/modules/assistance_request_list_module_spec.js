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
    });
});