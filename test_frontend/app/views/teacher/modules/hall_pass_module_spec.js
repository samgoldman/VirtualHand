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
                const spy_grantPass = spyOn(window, 'grantPass').and.stub();
                const spy_stopwatch_format = spyOn(window, 'stopwatch_format').and.returnValue('dummy_value');
                const spy_listItemTemplate = jasmine.createSpy('listItemTemplate').and.returnValue('dummy_value2');
                window.listItemTemplate = spy_listItemTemplate;
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(handleResponseRetrieveHallPassRequests({requests: []})).toBeUndefined();

                expect(spy_clearHallPassDivs.calls.count()).toEqual(1);
                expect(spy_clearHallPassDivs.calls.argsFor(0)).toEqual([]);

                expect(spy_countGranted.calls.count()).toEqual(1);
                expect(spy_countGranted.calls.argsFor(0)).toEqual([[]]); // Called with empty list

                expect(spy_grantPass.calls.count()).toEqual(0);

                expect(spy_stopwatch_format.calls.count()).toEqual(0);
                
                expect(spy_listItemTemplate.calls.count()).toEqual(0);
                
                expect(spy_querySelector.calls.count()).toEqual(0);

                expect(mock_element.innerHTML).toEqual('');
            });

            it('should clear the divs and, add all requests to their appropriate div and if there is no request granted, grant one', () => {
                const mock_element = {
                    innerHTML: ''
                };

                const spy_clearHallPassDivs = spyOn(window, 'clearHallPassDivs').and.stub();
                const spy_countGranted = spyOn(window, 'countGranted').and.returnValue(0); 
                const spy_grantPass = spyOn(window, 'grantPass').and.stub();
                const spy_stopwatch_format = spyOn(window, 'stopwatch_format').and.returnValues('sf1', 'sf2', 'sf3');
                const spy_listItemTemplate = jasmine.createSpy('listItemTemplate').and.returnValues('t1', 't2', 't3');
                window.listItemTemplate = spy_listItemTemplate;
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                const requests = [{granted: false, _id: 'i1', student: {username: 's1'}, grantedTime: 'gt', requestTime: 'rt'}, 
                                  {granted: false, _id: 'i2', student: {username: 's2'}, grantedTime: 'gt', requestTime: 'rt'},
                                  {granted: false, _id: 'i3', student: {username: 's3'}, grantedTime: 'gt', requestTime: 'rt'}]

                expect(handleResponseRetrieveHallPassRequests({requests: requests})).toBeUndefined();

                expect(spy_clearHallPassDivs.calls.count()).toEqual(1);
                expect(spy_clearHallPassDivs.calls.argsFor(0)).toEqual([]);

                expect(spy_countGranted.calls.count()).toEqual(1);
                expect(spy_countGranted.calls.argsFor(0)).toEqual([requests]); 

                expect(spy_grantPass.calls.count()).toEqual(1);
                expect(spy_grantPass.calls.argsFor(0)).toEqual(['i1']);

                expect(spy_stopwatch_format.calls.count()).toEqual(3);
                expect(spy_stopwatch_format.calls.argsFor(0)).toEqual(['rt']);
                expect(spy_stopwatch_format.calls.argsFor(1)).toEqual(['rt']);
                expect(spy_stopwatch_format.calls.argsFor(2)).toEqual(['rt']);
                
                expect(spy_listItemTemplate.calls.count()).toEqual(3);
                expect(spy_listItemTemplate.calls.argsFor(0)).toEqual([{username: 's1', hrid: 'i1', includeGrantButton: true, time: 'sf1'}]);
                expect(spy_listItemTemplate.calls.argsFor(1)).toEqual([{username: 's2', hrid: 'i2', includeGrantButton: true, time: 'sf2'}]);
                expect(spy_listItemTemplate.calls.argsFor(2)).toEqual([{username: 's3', hrid: 'i3', includeGrantButton: true, time: 'sf3'}]);
                
                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#waiting_for_pass_div']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#waiting_for_pass_div']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#waiting_for_pass_div']);
                
                expect(mock_element.innerHTML).toEqual('t1t2t3');
            });

            it('should clear the divs and, add all requests to their appropriate div and if there is request granted, grant none', () => {
                const mock_element = {
                    innerHTML: ''
                };

                const spy_clearHallPassDivs = spyOn(window, 'clearHallPassDivs').and.stub();
                const spy_countGranted = spyOn(window, 'countGranted').and.returnValue(1); 
                const spy_grantPass = spyOn(window, 'grantPass').and.stub();
                const spy_stopwatch_format = spyOn(window, 'stopwatch_format').and.returnValues('sf1', 'sf2', 'sf3');
                const spy_listItemTemplate = jasmine.createSpy('listItemTemplate').and.returnValues('t1', 't2', 't3');
                window.listItemTemplate = spy_listItemTemplate;
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                const requests = [{granted: false, _id: 'i1', student: {username: 's1'}, grantedTime: 'gt', requestTime: 'rt'}, 
                                  {granted: true, _id: 'i2', student: {username: 's2'}, grantedTime: 'gt', requestTime: 'rt'},
                                  {granted: false, _id: 'i3', student: {username: 's3'}, grantedTime: 'gt', requestTime: 'rt'}]

                expect(handleResponseRetrieveHallPassRequests({requests: requests})).toBeUndefined();

                expect(spy_clearHallPassDivs.calls.count()).toEqual(1);
                expect(spy_clearHallPassDivs.calls.argsFor(0)).toEqual([]);

                expect(spy_countGranted.calls.count()).toEqual(1);
                expect(spy_countGranted.calls.argsFor(0)).toEqual([requests]); 

                expect(spy_grantPass.calls.count()).toEqual(0);

                expect(spy_stopwatch_format.calls.count()).toEqual(3);
                expect(spy_stopwatch_format.calls.argsFor(0)).toEqual(['rt']);
                expect(spy_stopwatch_format.calls.argsFor(1)).toEqual(['gt']);
                expect(spy_stopwatch_format.calls.argsFor(2)).toEqual(['rt']);
                
                expect(spy_listItemTemplate.calls.count()).toEqual(3);
                expect(spy_listItemTemplate.calls.argsFor(0)).toEqual([{username: 's1', hrid: 'i1', includeGrantButton: true, time: 'sf1'}]);
                expect(spy_listItemTemplate.calls.argsFor(1)).toEqual([{username: 's2', hrid: 'i2', includeGrantButton: false, time: 'sf2'}]);
                expect(spy_listItemTemplate.calls.argsFor(2)).toEqual([{username: 's3', hrid: 'i3', includeGrantButton: true, time: 'sf3'}]);
                
                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#waiting_for_pass_div']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#out_of_room_div']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#waiting_for_pass_div']);
                
                expect(mock_element.innerHTML).toEqual('t1t2t3');
            });
        });

        describe('>initHallPassModule', () => {
            it('should be defined', () => {
                expect(initHallPassModule).toBeDefined();
            });

            it('should init event listeners and socket handlers', () => {
                const mock_socket = {
                    on: () => undefined
                };
                socket = mock_socket;

                const mock_element = {
                    addEventListener: () => undefined
                }

                const spy_on = spyOn(mock_socket, 'on').and.stub();
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.stub();
                const spy_setInterval = spyOn(window, 'setInterval').and.stub();

                expect(initHallPassModule()).toBeUndefined();

                expect(spy_on.calls.count()).toEqual(2);
                expect(spy_on.calls.argsFor(0)).toEqual(['Broadcast_HallPassRequestModified', RetrieveHallPassRequests]);
                expect(spy_on.calls.argsFor(1)).toEqual(['Response_RetrieveHallPassRequests', handleResponseRetrieveHallPassRequests]);

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#clear-all-hp']);

                expect(spy_addEventListener.calls.count()).toEqual(2);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', RetrieveHallPassRequests]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['click', ClearAllHallPassRequests]);

                expect(spy_setInterval.calls.count()).toEqual(1);
                expect(spy_setInterval.calls.argsFor(0)).toEqual([RetrieveHallPassRequests, 1000]);
            });
        });
       
        describe('>clearHallPassDivs', () => {
            it('should be defined', () => {
                expect(clearHallPassDivs).toBeDefined();
            });

            it('should clear both divs', () => {
                const mock_element_1 = {
                    innerHTML: 'a'
                };

                const mock_element_2 = {
                    innerHTML: 'aaaa'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_element_1, mock_element_2);

                expect(clearHallPassDivs()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#out_of_room_div']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#waiting_for_pass_div']);

                expect(mock_element_1).toEqual({innerHTML: ''});
                expect(mock_element_2).toEqual({innerHTML: ''});
            });
        });


        describe('>ClearAllHallPassRequests', () => {
            it('should be defined', () => {
                expect(ClearAllHallPassRequests).toBeDefined();
            });

            it('should do nothing if no class is selected', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.stub();
                const spy_getSelectedClassIds = spyOn(window, 'getSelectedClassIds').and.returnValue([]);

                expect(ClearAllHallPassRequests()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(0);
                
                expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                expect(spy_getSelectedClassIds.calls.argsFor(0)).toEqual([]);
            });

            it('should make a clear request for each selected class', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.stub();
                const spy_getSelectedClassIds = spyOn(window, 'getSelectedClassIds').and.returnValue(['a', '1', '3']);

                expect(ClearAllHallPassRequests()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(3);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_TeacherResolveAllHallPassRequests', {cid: 'a'}]);
                expect(spy_emit.calls.argsFor(1)).toEqual(['Request_TeacherResolveAllHallPassRequests', {cid: '1'}]);
                expect(spy_emit.calls.argsFor(2)).toEqual(['Request_TeacherResolveAllHallPassRequests', {cid: '3'}]);
                
                expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                expect(spy_getSelectedClassIds.calls.argsFor(0)).toEqual([]);
            });
        });
    });
});