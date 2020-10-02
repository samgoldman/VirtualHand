define((require) => {

    describe('delete_course_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/delete_course_module');
        });

        describe('>clearDeleteCourseModule', () => {
            it('should be defined', () => {
                expect(clearDeleteCourseModal).toBeDefined();
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

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_alert_box, mock_input);

                expect(clearDeleteCourseModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#delete_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#delete_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#delete_class_confirm']);

                expect(mock_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerHTML: ''});
            });
        });

        describe('>DeleteCourse', () => {
            it('should be defined', () => {
                expect(DeleteCourse).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_course');
                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

                expect(DeleteCourse()).toBeUndefined();

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_DeleteCourse', {cid: 'test_course'}]);
            });
        });

        describe('>initDeleteCourseModule', () => {
            it('should be defined', () => {
                expect(initDeleteCourseModule).toBeDefined();
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

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_querySelector);
                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_jquery_on = spyOn(mock_jquery_result, 'on').and.callThrough();
                const spy_addEventListener = spyOn(mock_querySelector, 'addEventListener').and.callThrough();
                const spy_socket_on = spyOn(mock_socket, 'on').and.callThrough();

                expect(initDeleteCourseModule()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#delete_class_button']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#delete_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#delete_class_submit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.delete-class-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', clearDeleteCourseModal]);

                expect(spy_addEventListener.calls.count()).toEqual(3);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', populateDeleteCourseModule]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['keyup', DeleteCourseConfirmClassname]);
                expect(spy_addEventListener.calls.argsFor(2)).toEqual(['click', DeleteCourse]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_DeleteCourse', handleDeleteCourseResponse]);
            });
        });

        describe('>handleDeleteCourseReponse', () => {
            it('should be defined', () => {
                expect(handleDeleteCourseResponse).toBeDefined()
            });
            
            it('should delete the selected course', () => {
                const mock_alert_box = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const mock_select = {
                    value: 'test_value',
                    style: {
                        display: 'block'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_alert_box, mock_select);
                const spy_RemoveClass = spyOn(window, 'RemoveClass').and.stub();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_id_42');

                expect(handleDeleteCourseResponse({message: 'message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#delete_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#delete_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#delete_class_confirm']);

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_RemoveClass.calls.count()).toEqual(1);
                expect(spy_RemoveClass.calls.argsFor(0)).toEqual(['test_id_42']);

                expect(mock_alert_box).toEqual({innerHTML: 'message', style: {display: 'block'}});
                expect(mock_select).toEqual({value: '', style: {display: 'block'}});
            });
        });

        describe('>populateDeleteCourseModule', () => {
            it('should be defined', () => {
                expect(populateDeleteCourseModule).toBeDefined();
            });

            it('should populate the span with the name of the selected class', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'block'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_element, {textContent: 'some_class_name'});

                expect(populateDeleteCourseModule({message: 'message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#delete_class_classname']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#class_selector option:checked']);

                expect(mock_element).toEqual({innerHTML: 'some_class_name', style: {display: 'block'}});
            });
        });

        describe('>DeleteCourseConfirmClassname', () => {
            it('should be defined', () => {
                expect(DeleteCourseConfirmClassname).toBeDefined();
            });

            it('should disable the submission button if the values do not match', () => {
                const mock_element = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues({textContent: 'some_text_1'}, {value: 'some_text_2'}, mock_element);
                const spy_removeAttribute = spyOn(mock_element, 'removeAttribute').and.stub();
                const spy_setAttribute = spyOn(mock_element, 'setAttribute').and.stub();

                expect(DeleteCourseConfirmClassname()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#delete_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#delete_class_submit']);

                expect(spy_removeAttribute.calls.count()).toEqual(0);

                expect(spy_setAttribute.calls.count()).toEqual(1);
                expect(spy_setAttribute.calls.argsFor(0)).toEqual(['disabled', 'disabled'])
            });

            it('should enable the submission button if the values match', () => {
                const mock_element = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues({textContent: 'some_text_3'}, {value: 'some_text_3'}, mock_element);
                const spy_removeAttribute = spyOn(mock_element, 'removeAttribute').and.stub();
                const spy_setAttribute = spyOn(mock_element, 'setAttribute').and.stub();

                expect(DeleteCourseConfirmClassname()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#delete_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#delete_class_submit']);

                expect(spy_removeAttribute.calls.count()).toEqual(1);
                expect(spy_removeAttribute.calls.argsFor(0)).toEqual(['disabled']);

                expect(spy_setAttribute.calls.count()).toEqual(0);
            });
        })
    });
});