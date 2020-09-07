
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