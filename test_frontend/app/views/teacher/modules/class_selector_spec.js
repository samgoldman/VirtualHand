define((require) => {

    describe('class_selector', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/class_selector');
        });

        describe('>ClassSelectorInit_Teacher', () => {
            it('should be defined', () => {
                expect(ClassSelectorInit_Teacher).toBeDefined();
            });

            it('>should call sortClasses and set UpdateManagementButtons as an event listener for class_selector changing', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };
                
                const spy_sortClasses = spyOn(window, 'sortClasses').and.returnValue(undefined);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();

                expect(ClassSelectorInit_Teacher()).toBeUndefined();

                expect(spy_sortClasses.calls.count()).toEqual(1);
                expect(spy_sortClasses.calls.argsFor(0)).toEqual([]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', UpdateManagementButtons]);
            });
        });

        describe('>UpdateManagementButtons', () => {
            it('should be defined', () => {
                expect(UpdateManagementButtons).toBeDefined()
            });

            it('should enable the buttons iff one class is selected', () => {
                const mock_button = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined,
                    classList: {
                        remove: () => undefined,
                        push: () => undefined
                    }
                };

                const mock_link_element = {
                    setAttribute: () => undefined
                };

                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('selected_id');
                const spy_querySelectorAll = spyOn(document, 'querySelectorAll').and.returnValues(['one_option'], [mock_button, mock_button]);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_link_element);
                const spy_removeAttribute = spyOn(mock_button, 'removeAttribute').and.callThrough();
                const spy_setAttribute_button = spyOn(mock_button, 'setAttribute').and.callThrough();
                const spy_remove = spyOn(mock_button.classList, 'remove').and.callThrough();
                const spy_push = spyOn(mock_button.classList, 'push').and.callThrough();
                const spy_setAttribute_link = spyOn(mock_link_element, 'setAttribute').and.callThrough();

                expect(UpdateManagementButtons()).toBeUndefined();

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_querySelectorAll.calls.count()).toEqual(2);
                expect(spy_querySelectorAll.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelectorAll.calls.argsFor(1)).toEqual(['.management_button']);

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#ar_history_link']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#hp_history_link']);

                expect(spy_removeAttribute.calls.count()).toEqual(2);
                expect(spy_removeAttribute.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_removeAttribute.calls.argsFor(1)).toEqual(['disabled']);

                expect(spy_setAttribute_button.calls.count()).toEqual(0);

                expect(spy_remove.calls.count()).toEqual(2);
                expect(spy_remove.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_remove.calls.argsFor(1)).toEqual(['disabled']);

                expect(spy_push.calls.count()).toEqual(0);
                
                expect(spy_setAttribute_link.calls.count()).toEqual(2);
                expect(spy_setAttribute_link.calls.argsFor(0)).toEqual(['href', '/teacher/history/assistancerequest/selected_id']);
                expect(spy_setAttribute_link.calls.argsFor(1)).toEqual(['href', '/teacher/history/hallpass/selected_id']);
            });
        });

        describe('>UpdateManagementButtons', () => {
            it('should be defined', () => {
                expect(UpdateManagementButtons).toBeDefined()
            });

            it('should disable the buttons if no class is selected', () => {
                const mock_button = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined,
                    classList: {
                        remove: () => undefined,
                        push: () => undefined
                    }
                };

                const mock_link_element = {
                    setAttribute: () => undefined
                };

                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('selected_id');
                const spy_querySelectorAll = spyOn(document, 'querySelectorAll').and.returnValues([/**no options selected */], [mock_button, mock_button]);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_link_element);
                const spy_removeAttribute = spyOn(mock_button, 'removeAttribute').and.callThrough();
                const spy_setAttribute_button = spyOn(mock_button, 'setAttribute').and.callThrough();
                const spy_remove = spyOn(mock_button.classList, 'remove').and.callThrough();
                const spy_push = spyOn(mock_button.classList, 'push').and.callThrough();
                const spy_setAttribute_link = spyOn(mock_link_element, 'setAttribute').and.callThrough();

                expect(UpdateManagementButtons()).toBeUndefined();

                expect(spy_getSelectedClassId.calls.count()).toEqual(0);

                expect(spy_querySelectorAll.calls.count()).toEqual(2);
                expect(spy_querySelectorAll.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelectorAll.calls.argsFor(1)).toEqual(['.management_button']);

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#ar_history_link']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#hp_history_link']);

                expect(spy_removeAttribute.calls.count()).toEqual(0);

                expect(spy_setAttribute_button.calls.count()).toEqual(2);
                expect(spy_setAttribute_button.calls.argsFor(0)).toEqual(['disabled', 'disabled']);
                expect(spy_setAttribute_button.calls.argsFor(1)).toEqual(['disabled', 'disabled']);

                expect(spy_remove.calls.count()).toEqual(0);

                expect(spy_push.calls.count()).toEqual(2);
                expect(spy_push.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_push.calls.argsFor(1)).toEqual(['disabled']);
                
                expect(spy_setAttribute_link.calls.count()).toEqual(2);
                expect(spy_setAttribute_link.calls.argsFor(0)).toEqual(['href', 'javascript:;']);
                expect(spy_setAttribute_link.calls.argsFor(1)).toEqual(['href', 'javascript:;']);
            });
        });

        describe('>UpdateManagementButtons', () => {
            it('should be defined', () => {
                expect(UpdateManagementButtons).toBeDefined()
            });

            it('should disable the buttons if more than one class is selected', () => {
                const mock_button = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined,
                    classList: {
                        remove: () => undefined,
                        push: () => undefined
                    }
                };

                const mock_link_element = {
                    setAttribute: () => undefined
                };

                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('selected_id');
                const spy_querySelectorAll = spyOn(document, 'querySelectorAll').and.returnValues(['selection 1', 'selection 2'], [mock_button, mock_button]);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_link_element);
                const spy_removeAttribute = spyOn(mock_button, 'removeAttribute').and.callThrough();
                const spy_setAttribute_button = spyOn(mock_button, 'setAttribute').and.callThrough();
                const spy_remove = spyOn(mock_button.classList, 'remove').and.callThrough();
                const spy_push = spyOn(mock_button.classList, 'push').and.callThrough();
                const spy_setAttribute_link = spyOn(mock_link_element, 'setAttribute').and.callThrough();

                expect(UpdateManagementButtons()).toBeUndefined();

                expect(spy_getSelectedClassId.calls.count()).toEqual(0);

                expect(spy_querySelectorAll.calls.count()).toEqual(2);
                expect(spy_querySelectorAll.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelectorAll.calls.argsFor(1)).toEqual(['.management_button']);

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#ar_history_link']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#hp_history_link']);

                expect(spy_removeAttribute.calls.count()).toEqual(0);

                expect(spy_setAttribute_button.calls.count()).toEqual(2);
                expect(spy_setAttribute_button.calls.argsFor(0)).toEqual(['disabled', 'disabled']);
                expect(spy_setAttribute_button.calls.argsFor(1)).toEqual(['disabled', 'disabled']);

                expect(spy_remove.calls.count()).toEqual(0);

                expect(spy_push.calls.count()).toEqual(2);
                expect(spy_push.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_push.calls.argsFor(1)).toEqual(['disabled']);
                
                expect(spy_setAttribute_link.calls.count()).toEqual(2);
                expect(spy_setAttribute_link.calls.argsFor(0)).toEqual(['href', 'javascript:;']);
                expect(spy_setAttribute_link.calls.argsFor(1)).toEqual(['href', 'javascript:;']);
            });
        });

        describe('>AddClass', () => {
            it('should be defined', () => {
                expect(AddClass).toBeDefined();
            });

            it('should create a new option, append it to the select element, and call sortClasses', () => {
                const mock_element = {
                    appendChild: () => undefined
                };
                
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_appendChild = spyOn(mock_element, 'appendChild').and.callThrough();
                const spy_sortClasses = spyOn(window, 'sortClasses').and.returnValue(undefined);

                expect(AddClass('test_id', 'test_name')).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);

                expect(spy_appendChild.calls.count()).toEqual(1);
                expect(spy_appendChild.calls.argsFor(0)).toEqual([new Option('test_name', 'test_id')]);

                expect(spy_sortClasses.calls.count()).toEqual(1);
                expect(spy_sortClasses.calls.argsFor(0)).toEqual([]);
            });
        });
    });
});