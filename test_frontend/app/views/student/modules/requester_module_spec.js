
define((require) => {

    describe('requester_module', () => {
        beforeEach(() => {
            require('app/views/student/modules/requester_module');
        });

        describe('>RequesterModuleInit', () => {
            it('should be defined', async () => {
                expect(RequesterModuleInit).toBeDefined();
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