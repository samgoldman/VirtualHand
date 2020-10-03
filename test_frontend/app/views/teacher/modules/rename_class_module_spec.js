define((require) => {

    describe('rename_class_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/rename_class_module');
        });

        describe('>clearRenameClassModule', () => {
            it('should be defined', () => {
                expect(clearRenameClassModal).toBeDefined();
            });

            it('should clear the input box and clear+hide the alert box', () => {
                const mock_input = {
                    value: 'original_value',
                    style: {display: 'block'}
                };

                const mock_alert_box = {
                    style: {display: 'block'},
                    innerHTML: 'original_alert'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_input, mock_alert_box, mock_alert_box);

                expect(clearRenameClassModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_rename']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#rename_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#rename_class_alert_box']);

                expect(mock_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerHTML: ''});
            });
        });

        describe('>RenameClassClicked', () => {
            it('should be defined', () => {
                expect(RenameClassClicked).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue({value: 'test_value'});
                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue(42);

                expect(RenameClassClicked()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_rename']);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_CourseRename', {newCourseName: 'test_value', cid: 42}]);
                
                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>initRenameClassModule', () => {
            it('should be defined', () => {
                expect(initRenameClassModule).toBeDefined();
            });

            it('should initialize event handlers and socket listeners', () => {
                const mock_jquery_result = {
                    on: () => undefined
                };;

                const mock_querySelector = {
                    addEventListener: () => undefined
                };

                const mock_socket = {
                    on: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_querySelector);
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_jquery_on = spyOn(mock_jquery_result, 'on').and.callThrough();
                const spy_addEventListener = spyOn(mock_querySelector, 'addEventListener').and.callThrough();
                const spy_socket_on = spyOn(mock_socket, 'on').and.callThrough();

                expect(initRenameClassModule()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#rename_class_submit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.rename-class-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', initRenameClassModule]);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', RenameClassClicked]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_RenameCourse', handleResponseRenameCourse]);
            });
        });

        describe('>HandleResponseRenameCourse', () => {
            it('should be defined', () => {
                expect(handleResponseRenameCourse).toBeDefined()
            });

            it('should not rename a class in the selector if the rename was not successful', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_RenameClass = spyOn(window, 'RenameClass').and.stub();

                expect(handleResponseRenameCourse({message: 'failure message', success: false})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#rename_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#rename_class_alert_box']);

                expect(spy_RenameClass.calls.count()).toEqual(0);

                expect(mock_element).toEqual({innerHTML: 'failure message', style: {display: 'block'}});
            });

            it('should rename a class in the selector if the rename was successful', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_RenameClass = spyOn(window, 'RenameClass').and.stub();


                expect(handleResponseRenameCourse({message: 'class renamed successfully', success: true, courseId: 'test_cid', courseName: 'xyz'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#rename_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#rename_class_alert_box']);

                expect(spy_RenameClass.calls.count()).toEqual(1);
                expect(spy_RenameClass.calls.argsFor(0)).toEqual(['test_cid', 'xyz']);

                expect(mock_element).toEqual({innerHTML: 'class renamed successfully', style: {display: 'block'}});
            });
        });
    });
});