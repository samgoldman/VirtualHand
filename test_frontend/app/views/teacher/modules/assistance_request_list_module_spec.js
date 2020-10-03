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
                    const spy_RequestRandomStudent = spyOn(window, 'RequestRandomStudent').and.stub();
                    const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.stub();

                    const original_handDown = handDown;
                    const original_window_event = window.window_event;

                    handDown = spy_handDown;

                    expect(KeyDownHandler(event)).toBeUndefined();

                    expect(spy_handDown.calls.count()).toEqual(1);
                    expect(spy_handDown.calls.argsFor(0)).toEqual([expected]);

                    expect(spy_RequestRandomStudent.calls.count()).toEqual(0);

                    expect(spy_getSelectedClassId.calls.count()).toEqual(0);

                    handDown = original_handDown;
                    window.event = original_window_event;
                });
            });

            it('should call RequestRandomStudent for the selected class if the key is r', () => {
                const spy_handDown = jasmine.createSpy('handDown').and.stub();
                const spy_RequestRandomStudent = spyOn(window, 'RequestRandomStudent').and.stub();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('42');

                const original_handDown = handDown;

                handDown = spy_handDown;

                expect(KeyDownHandler(new KeyboardEvent('keydown', {keyCode: 114}))).toBeUndefined();

                expect(spy_handDown.calls.count()).toEqual(0);

                expect(spy_RequestRandomStudent.calls.count()).toEqual(1);
                expect(spy_RequestRandomStudent.calls.argsFor(0)).toEqual(['42'])

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                handDown = original_handDown;
            });
        });

        describe('>HandleRetrieveAssistanceRequests', () => {                
            it('should be defined', () => {
                expect(HandleRetrieveAssistanceRequests).toBeDefined();
            });

            it('should clear the listItems and not play the ding if there are 0 requests', () => {
                numRequests = 0;

                const mock_elements = [{innerHTML: 'e1', setAttribute: () => undefined},
                    {innerHTML: 'e2', setAttribute: () => undefined},
                    {innerHTML: 'e3', setAttribute: () => undefined},
                    {innerHTML: 'e4', setAttribute: () => undefined},
                    {innerHTML: 'e5', setAttribute: () => undefined},
                    {innerHTML: 'e6', setAttribute: () => undefined}];

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_elements[0], mock_elements[1], mock_elements[2], mock_elements[3], mock_elements[4], mock_elements[5]);
                const spy_setAttribute0 = spyOn(mock_elements[0], 'setAttribute').and.stub();
                const spy_setAttribute1 = spyOn(mock_elements[1], 'setAttribute').and.stub();
                const spy_setAttribute2 = spyOn(mock_elements[2], 'setAttribute').and.stub();
                const spy_setAttribute3 = spyOn(mock_elements[3], 'setAttribute').and.stub();
                const spy_setAttribute4 = spyOn(mock_elements[4], 'setAttribute').and.stub();
                const spy_setAttribute5 = spyOn(mock_elements[5], 'setAttribute').and.stub();

                const data = {requests: []};

                expect(HandleRetrieveAssistanceRequests(data)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(5);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#listItem0']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#listItem1']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#listItem2']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#listItem3']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#listItem4']);

                expect(spy_setAttribute0.calls.count()).toEqual(1);
                expect(spy_setAttribute0.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[0].innerHTML).toEqual('');

                expect(spy_setAttribute1.calls.count()).toEqual(1);
                expect(spy_setAttribute1.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[1].innerHTML).toEqual('');

                expect(spy_setAttribute2.calls.count()).toEqual(1);
                expect(spy_setAttribute2.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[2].innerHTML).toEqual('');

                expect(spy_setAttribute3.calls.count()).toEqual(1);
                expect(spy_setAttribute3.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[3].innerHTML).toEqual('');

                expect(spy_setAttribute4.calls.count()).toEqual(1);
                expect(spy_setAttribute4.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[4].innerHTML).toEqual('');

                expect(spy_setAttribute5.calls.count()).toEqual(0);
                expect(mock_elements[5].innerHTML).toEqual('e6');

                expect(numRequests).toEqual(0);
            });

            it('should update the list items if there are multiple requests and not play the ding if there are fewer requests now', () => {
                numRequests = 4;

                const mock_elements = [{innerHTML: 'e1', setAttribute: () => undefined},
                    {innerHTML: 'e2', setAttribute: () => undefined},
                    {innerHTML: 'e3', setAttribute: () => undefined},
                    {innerHTML: 'e4', setAttribute: () => undefined},
                    {innerHTML: 'e5', setAttribute: () => undefined},
                    {innerHTML: 'e6', setAttribute: () => undefined}];

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_elements[0], mock_elements[1], mock_elements[2], mock_elements[3], mock_elements[4], mock_elements[5]);
                const spy_setAttribute0 = spyOn(mock_elements[0], 'setAttribute').and.stub();
                const spy_setAttribute1 = spyOn(mock_elements[1], 'setAttribute').and.stub();
                const spy_setAttribute2 = spyOn(mock_elements[2], 'setAttribute').and.stub();
                const spy_setAttribute3 = spyOn(mock_elements[3], 'setAttribute').and.stub();
                const spy_setAttribute4 = spyOn(mock_elements[4], 'setAttribute').and.stub();
                const spy_setAttribute5 = spyOn(mock_elements[5], 'setAttribute').and.stub();

                const data = {requests: [{student: {username: 'u1'}, _id: 'i1'}, {student: {username: 'u2'}, _id: 'i2'}, {student: {username: 'u3'}, _id: 'i3'}]};

                expect(HandleRetrieveAssistanceRequests(data)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(5);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#listItem0']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#listItem1']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#listItem2']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#listItem3']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#listItem4']);

                expect(spy_setAttribute0.calls.count()).toEqual(1);
                expect(spy_setAttribute0.calls.argsFor(0)).toEqual(['value', 'i1']);
                expect(mock_elements[0].innerHTML).toEqual('u1');

                expect(spy_setAttribute1.calls.count()).toEqual(1);
                expect(spy_setAttribute1.calls.argsFor(0)).toEqual(['value', 'i2']);
                expect(mock_elements[1].innerHTML).toEqual('u2');

                expect(spy_setAttribute2.calls.count()).toEqual(1);
                expect(spy_setAttribute2.calls.argsFor(0)).toEqual(['value', 'i3']);
                expect(mock_elements[2].innerHTML).toEqual('u3');

                expect(spy_setAttribute3.calls.count()).toEqual(1);
                expect(spy_setAttribute3.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[3].innerHTML).toEqual('');

                expect(spy_setAttribute4.calls.count()).toEqual(1);
                expect(spy_setAttribute4.calls.argsFor(0)).toEqual(['value', '']);
                expect(mock_elements[4].innerHTML).toEqual('');

                expect(spy_setAttribute5.calls.count()).toEqual(0);
                expect(mock_elements[5].innerHTML).toEqual('e6');

                expect(numRequests).toEqual(3);
            });

            it('should update the list items if there are multiple requests and play the ding if the ding checkbox is checked', () => {
                numRequests = 4;

                const mock_elements = [{checked: true}, {play: () => undefined}, 
                    {innerHTML: 'e1', setAttribute: () => undefined},
                    {innerHTML: 'e2', setAttribute: () => undefined},
                    {innerHTML: 'e3', setAttribute: () => undefined},
                    {innerHTML: 'e4', setAttribute: () => undefined},
                    {innerHTML: 'e5', setAttribute: () => undefined},
                    {innerHTML: 'e6', setAttribute: () => undefined}];

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_elements[0], mock_elements[1], mock_elements[2], mock_elements[3], mock_elements[4], mock_elements[5], mock_elements[6], mock_elements[7]);
                const spy_setAttribute0 = spyOn(mock_elements[2], 'setAttribute').and.stub();
                const spy_setAttribute1 = spyOn(mock_elements[3], 'setAttribute').and.stub();
                const spy_setAttribute2 = spyOn(mock_elements[4], 'setAttribute').and.stub();
                const spy_setAttribute3 = spyOn(mock_elements[5], 'setAttribute').and.stub();
                const spy_setAttribute4 = spyOn(mock_elements[6], 'setAttribute').and.stub();
                const spy_setAttribute5 = spyOn(mock_elements[7], 'setAttribute').and.stub();                    
                const mock_play = spyOn(mock_elements[1], 'play').and.stub();

                const data = {requests: [{student: {username: 'u1'}, _id: 'i1'}, {student: {username: 'u2'}, _id: 'i2'}, {student: {username: 'u3'}, _id: 'i3'}, {student: {username: 'u4'}, _id: 'i4'}, {student: {username: 'u5'}, _id: 'i5'}, {student: {username: 'u6'}, _id: 'i6'}]};

                expect(HandleRetrieveAssistanceRequests(data)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(7);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#audioCheck']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#ding']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#listItem0']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#listItem1']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#listItem2']);
                expect(spy_querySelector.calls.argsFor(5)).toEqual(['#listItem3']);
                expect(spy_querySelector.calls.argsFor(6)).toEqual(['#listItem4']);

                expect(spy_setAttribute0.calls.count()).toEqual(1);
                expect(spy_setAttribute0.calls.argsFor(0)).toEqual(['value', 'i1']);
                expect(mock_elements[2].innerHTML).toEqual('u1');

                expect(spy_setAttribute1.calls.count()).toEqual(1);
                expect(spy_setAttribute1.calls.argsFor(0)).toEqual(['value', 'i2']);
                expect(mock_elements[3].innerHTML).toEqual('u2');

                expect(spy_setAttribute2.calls.count()).toEqual(1);
                expect(spy_setAttribute2.calls.argsFor(0)).toEqual(['value', 'i3']);
                expect(mock_elements[4].innerHTML).toEqual('u3');

                expect(spy_setAttribute3.calls.count()).toEqual(1);
                expect(spy_setAttribute3.calls.argsFor(0)).toEqual(['value', 'i4']);
                expect(mock_elements[5].innerHTML).toEqual('u4');

                expect(spy_setAttribute4.calls.count()).toEqual(1);
                expect(spy_setAttribute4.calls.argsFor(0)).toEqual(['value', 'i5']);
                expect(mock_elements[6].innerHTML).toEqual('u5');

                expect(spy_setAttribute5.calls.count()).toEqual(0);
                expect(mock_elements[7].innerHTML).toEqual('e6');

                expect(mock_play.calls.count()).toEqual(1);
                expect(mock_play.calls.argsFor(0)).toEqual([]);

                expect(numRequests).toEqual(6);
            });

            it('should update the list items if there are multiple requests and not play the ding if the ding checkbox is not', () => {
                numRequests = 4;

                const mock_elements = [{checked: false}, 
                    {innerHTML: 'e1', setAttribute: () => undefined},
                    {innerHTML: 'e2', setAttribute: () => undefined},
                    {innerHTML: 'e3', setAttribute: () => undefined},
                    {innerHTML: 'e4', setAttribute: () => undefined},
                    {innerHTML: 'e5', setAttribute: () => undefined},
                    {innerHTML: 'e6', setAttribute: () => undefined}];

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_elements[0], mock_elements[1], mock_elements[2], mock_elements[3], mock_elements[4], mock_elements[5], mock_elements[6]);
                const spy_setAttribute0 = spyOn(mock_elements[1], 'setAttribute').and.stub();
                const spy_setAttribute1 = spyOn(mock_elements[2], 'setAttribute').and.stub();
                const spy_setAttribute2 = spyOn(mock_elements[3], 'setAttribute').and.stub();
                const spy_setAttribute3 = spyOn(mock_elements[4], 'setAttribute').and.stub();
                const spy_setAttribute4 = spyOn(mock_elements[5], 'setAttribute').and.stub();
                const spy_setAttribute5 = spyOn(mock_elements[6], 'setAttribute').and.stub();                    

                const data = {requests: [{student: {username: 'u1'}, _id: 'i1'}, {student: {username: 'u2'}, _id: 'i2'}, {student: {username: 'u3'}, _id: 'i3'}, {student: {username: 'u4'}, _id: 'i4'}, {student: {username: 'u5'}, _id: 'i5'}, {student: {username: 'u6'}, _id: 'i6'}]};

                expect(HandleRetrieveAssistanceRequests(data)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(6);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#audioCheck']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#listItem0']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#listItem1']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#listItem2']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#listItem3']);
                expect(spy_querySelector.calls.argsFor(5)).toEqual(['#listItem4']);

                expect(spy_setAttribute0.calls.count()).toEqual(1);
                expect(spy_setAttribute0.calls.argsFor(0)).toEqual(['value', 'i1']);
                expect(mock_elements[1].innerHTML).toEqual('u1');

                expect(spy_setAttribute1.calls.count()).toEqual(1);
                expect(spy_setAttribute1.calls.argsFor(0)).toEqual(['value', 'i2']);
                expect(mock_elements[2].innerHTML).toEqual('u2');

                expect(spy_setAttribute2.calls.count()).toEqual(1);
                expect(spy_setAttribute2.calls.argsFor(0)).toEqual(['value', 'i3']);
                expect(mock_elements[3].innerHTML).toEqual('u3');

                expect(spy_setAttribute3.calls.count()).toEqual(1);
                expect(spy_setAttribute3.calls.argsFor(0)).toEqual(['value', 'i4']);
                expect(mock_elements[4].innerHTML).toEqual('u4');

                expect(spy_setAttribute4.calls.count()).toEqual(1);
                expect(spy_setAttribute4.calls.argsFor(0)).toEqual(['value', 'i5']);
                expect(mock_elements[5].innerHTML).toEqual('u5');

                expect(spy_setAttribute5.calls.count()).toEqual(0);
                expect(mock_elements[6].innerHTML).toEqual('e6');

                expect(numRequests).toEqual(6);
            });
        });

        describe('>handDown', () => {
            it('should be defined', () => {
                expect(handDown).toBeDefined();
            });

            it('should check if the listItem has a value and if it doesn\'t, do nothing', () => {
                const mock_element = {
                    getAttribute: () => undefined
                };

                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_getAttribute = spyOn(mock_element, 'getAttribute').and.returnValue('');
                const spy_emit = spyOn(socket, 'emit').and.stub();

                expect(handDown(3)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#listItem3']);

                expect(spy_getAttribute.calls.count()).toEqual(1);
                expect(spy_getAttribute.calls.argsFor(0)).toEqual(['value']);

                expect(spy_emit.calls.count()).toEqual(0);
            });

            it('should check if the listItem has a value and if it does, emit a request to the server', () => {
                const mock_element = {
                    getAttribute: () => undefined
                };

                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_getAttribute = spyOn(mock_element, 'getAttribute').and.returnValue('some_value');
                const spy_emit = spyOn(socket, 'emit').and.stub();

                expect(handDown(42)).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#listItem42']);

                expect(spy_getAttribute.calls.count()).toEqual(2);
                expect(spy_getAttribute.calls.argsFor(0)).toEqual(['value']);
                expect(spy_getAttribute.calls.argsFor(1)).toEqual(['value']);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_TeacherResolveAssistanceRequest', {arid: 'some_value'}])
            });
        });
    });
});