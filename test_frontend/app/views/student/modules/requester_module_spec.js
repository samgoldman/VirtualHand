
define((require) => {

    describe('requester_module', () => {
        beforeEach(() => {
            require('app/views/student/modules/requester_module');
        });

        describe('>RequesterModuleInit', () => {
            it('should be defined', async () => {
                expect(RequesterModuleInit).toBeDefined();
            });

            it('should add event listeners, socket.io handlers, and setup the audio', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };

                const mock_socket = {
                    on: () => undefined
                };

                const mock_jquery_result = {
                    hide: () => undefined,
                    on: () => undefined
                };

                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_socket_on = spyOn(mock_socket, 'on').and.callThrough();
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();
                const spy_jquery_on = spyOn(mock_jquery_result, 'on').and.callThrough();
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_hide = spyOn(mock_jquery_result, 'hide').and.callThrough();

                expect(RequesterModuleInit()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(5);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestAssistanceButton']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#requestHallPassButton']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#class_selector']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#class_selector']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#return-pass-button']);

                expect(spy_addEventListener.calls.count()).toEqual(5);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', ToggleAssistanceButton]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['click', ToggleHallPassButton]);
                expect(spy_addEventListener.calls.argsFor(2)).toEqual(['change', UpdateAssistanceRequestStatus]);
                expect(spy_addEventListener.calls.argsFor(3)).toEqual(['change', UpdateHallPassRequestStatus]);
                expect(spy_addEventListener.calls.argsFor(4)).toEqual(['click', ReturnHallPass]);

                expect(spy_socket_on.calls.count()).toEqual(4);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_HallPassRequestStatus', ProcessHallPassRequestStatus]);
                expect(spy_socket_on.calls.argsFor(1)).toEqual(['Broadcast_HallPassRequestModified', UpdateHallPassRequestStatus]);
                expect(spy_socket_on.calls.argsFor(2)).toEqual(['Response_AssistanceRequestStatus', ProcessAssistanceRequestStatus]);
                expect(spy_socket_on.calls.argsFor(3)).toEqual(['Broadcast_AssistanceRequestModified', UpdateAssistanceRequestStatus]);

                expect(spy_jquery.calls.count()).toEqual(2);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['#audioModule']);
                expect(spy_jquery.calls.argsFor(1)).toEqual(['#hall-pass-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['shown.bs.modal', ding]);

                expect(spy_hide.calls.count()).toEqual(1);
                expect(spy_hide.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>ProcessHallPassRequestStatus', () => {
            it('should be defined', () => {
                expect(ProcessHallPassRequestStatus).toBeDefined();
            });

            it('should reset the hall pass request button and close the modal if the data does not contain a request', () => {
                const mock_element = {
                    innerHTML: 'test',
                    classList: {
                        add: () => undefined,
                        remove: () => undefined
                    }
                };

                const mock_jquery_result = {
                    modal: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_add = spyOn(mock_element.classList, 'add').and.callThrough();
                const spy_remove = spyOn(mock_element.classList, 'remove').and.callThrough();
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_modal = spyOn(mock_jquery_result, 'modal').and.returnValue(undefined);

                expect(ProcessHallPassRequestStatus({request: undefined})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestHallPassButton']);

                expect(spy_add.calls.count()).toEqual(1);
                expect(spy_add.calls.argsFor(0)).toEqual(['btn-success']);

                expect(spy_remove.calls.count()).toEqual(1);
                expect(spy_remove.calls.argsFor(0)).toEqual(['btn-default', 'btn-danger']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['#hall-pass-modal']);

                expect(spy_modal.calls.count()).toEqual(1);
                expect(spy_modal.calls.argsFor(0)).toEqual(['hide']);

                expect(mock_element.innerHTML).toEqual("Request a Hall Pass");
            });

            it('should set hall pass request button to waiting and close the modal if the data contains a request, but it is not granted', () => {
                const mock_element = {
                    innerHTML: 'test',
                    classList: {
                        add: () => undefined,
                        remove: () => undefined
                    }
                };

                const mock_jquery_result = {
                    modal: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_add = spyOn(mock_element.classList, 'add').and.callThrough();
                const spy_remove = spyOn(mock_element.classList, 'remove').and.callThrough();
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_modal = spyOn(mock_jquery_result, 'modal').and.returnValue(undefined);

                expect(ProcessHallPassRequestStatus({request: {granted: false}})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestHallPassButton']);

                expect(spy_add.calls.count()).toEqual(1);
                expect(spy_add.calls.argsFor(0)).toEqual(['btn-danger']);

                expect(spy_remove.calls.count()).toEqual(1);
                expect(spy_remove.calls.argsFor(0)).toEqual(['btn-default', 'btn-success']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['#hall-pass-modal']);

                expect(spy_modal.calls.count()).toEqual(1);
                expect(spy_modal.calls.argsFor(0)).toEqual(['hide']);

                expect(mock_element.innerHTML).toEqual("You are waiting for a hall pass. Click to withdraw your request.");
            });

            [{now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-01 00:00:00'), expected: '00:00'},
            {now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-01 00:00:10'), expected: '00:10'},
            {now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-01 00:10:00'), expected: '10:00'},
            {now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-01 10:00:00'), expected: '10:00:00'},
            {now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-02 00:00:42'), expected: '1:00:00:42'},
            {now: new Date('2020-01-01 00:00:00'), grantedTime: new Date('2020-01-03 17:12:09'), expected: '2:17:12:09'}]
            .forEach(testCase => {
                it(`should display the modal with ${testCase.expected} when the granted time is ${testCase.grantedTime} and the current time is ${testCase.now}`, () => {
                    const mock_button = {
                        innerHTML: 'test',
                        classList: {
                            add: () => undefined,
                            remove: () => undefined
                        }
                    };
                    const mock_timedisplay = {
                        innerHTML: 'test'
                    };

                    const mock_jquery_result = {
                        modal: () => undefined
                    }

                    const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_button, mock_timedisplay);
                    const spy_add = spyOn(mock_button.classList, 'add').and.callThrough();
                    const spy_remove = spyOn(mock_button.classList, 'remove').and.callThrough();
                    const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                    $ = spy_jquery;
                    const spy_modal = spyOn(mock_jquery_result, 'modal').and.returnValue(undefined);
                    const spy_now = spyOn(Date, 'now').and.returnValue(testCase.now);
                    const spy_setTimeout = spyOn(window, 'setTimeout')

                    expect(ProcessHallPassRequestStatus({request: {granted: true, grantedTime: testCase.grantedTime}})).toBeUndefined();

                    expect(spy_querySelector.calls.count()).toEqual(2);
                    expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestHallPassButton']);
                    expect(spy_querySelector.calls.argsFor(1)).toEqual(['#pass_timer']);
                
                    expect(spy_add.calls.count()).toEqual(0);

                    expect(spy_remove.calls.count()).toEqual(0);

                    expect(spy_jquery.calls.count()).toEqual(1);
                    expect(spy_jquery.calls.argsFor(0)).toEqual(['#hall-pass-modal']);

                    expect(spy_modal.calls.count()).toEqual(1);
                    expect(spy_modal.calls.argsFor(0)).toEqual([{backdrop: 'static', keyboard: false}]);

                    expect(spy_now.calls.count()).toEqual(1);
                    expect(spy_now.calls.argsFor(0)).toEqual([]);

                    expect(spy_setTimeout.calls.count()).toEqual(1);
                    expect(spy_setTimeout.calls.argsFor(0)).toEqual([UpdateHallPassRequestStatus, 1000]);

                    expect(mock_button.innerHTML).toEqual("test");
                    expect(mock_timedisplay.innerHTML).toEqual(testCase.expected);
                });
            });
        
        });

        describe('>ProcessAssistanceRequestStatus', () => {
            it('should be defined', () => {
                expect(ProcessAssistanceRequestStatus).toBeDefined();
            });

            it('should change the button to the raised state if data.status is true', () => {
                const mock_element = {
                    innerHTML: 'test',
                    classList: {
                        add: () => undefined,
                        remove: () => undefined
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_add = spyOn(mock_element.classList, 'add').and.callThrough();
                const spy_remove = spyOn(mock_element.classList, 'remove').and.callThrough();

                expect(ProcessAssistanceRequestStatus({status: true})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestAssistanceButton']);

                expect(spy_add.calls.count()).toEqual(1);
                expect(spy_add.calls.argsFor(0)).toEqual(['btn-danger']);

                expect(spy_remove.calls.count()).toEqual(1);
                expect(spy_remove.calls.argsFor(0)).toEqual(['btn-default', 'btn-success']);

                expect(mock_element.innerHTML).toEqual('Lower Hand');
            });

            it('should change the button to the lowered state if data.status is false', () => {
                const mock_element = {
                    innerHTML: 'test',
                    classList: {
                        add: () => undefined,
                        remove: () => undefined
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_add = spyOn(mock_element.classList, 'add').and.callThrough();
                const spy_remove = spyOn(mock_element.classList, 'remove').and.callThrough();

                expect(ProcessAssistanceRequestStatus({status: false})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#requestAssistanceButton']);

                expect(spy_add.calls.count()).toEqual(1);
                expect(spy_add.calls.argsFor(0)).toEqual(['btn-success']);

                expect(spy_remove.calls.count()).toEqual(1);
                expect(spy_remove.calls.argsFor(0)).toEqual(['btn-default', 'btn-danger']);

                expect(mock_element.innerHTML).toEqual('Raise Hand');
            });
        });

        describe('>ding', () => {
            it('should be defined', async () => {
                expect(ding).toBeDefined();
            });

            it('should find the #ding element and play it', () => {
                const mock_element = {
                    play: () => undefined
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_play = spyOn(mock_element, 'play').and.callThrough();

                expect(ding()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#ding']);

                expect(spy_play.calls.count()).toEqual(1);
                expect(spy_play.calls.argsFor(0)).toEqual([]);
            });
        });

    });
});