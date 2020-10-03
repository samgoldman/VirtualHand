define((require) => {

    describe('remove_all_student_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/remove_all_student_module');
        });

        describe('>clearRemoveAllStudentsModal', () => {
            it('should be defined', () => {
                expect(clearRemoveAllStudentsModal).toBeDefined();
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

                expect(clearRemoveAllStudentsModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_all_students_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#remove_all_students_alert_box']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#remove_all_class_confirm']);

                expect(mock_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerHTML: ''});
            });
        });

        describe('>RemoveAllStudents', () => {
            it('should be defined', () => {
                expect(RemoveAllStudents).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_course');
                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

                expect(RemoveAllStudents()).toBeUndefined();

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_RemoveAllStudents', {cid: 'test_course'}]);
            });
        });

        describe('>initRemoveAllStudentsModule', () => {
            it('should be defined', () => {
                expect(initRemoveAllStudentsModule).toBeDefined();
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

                expect(initRemoveAllStudentsModule()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_all_students_button']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#remove_all_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#remove_all_students_submit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.remove-all-students-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', clearRemoveAllStudentsModal]);

                expect(spy_addEventListener.calls.count()).toEqual(3);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', populateRemoveAllStudentsModal]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['keyup', RemoveAllConfirmClassname]);
                expect(spy_addEventListener.calls.argsFor(2)).toEqual(['click', RemoveAllStudents]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_RemoveAllStudents', handleResponseRemoveAllStudents]);
            });
        });

        describe('>handleResponseRemoveAllStudents', () => {
            it('should be defined', () => {
                expect(handleResponseRemoveAllStudents).toBeDefined()
            });
            
            it('should delete the selected course', () => {
                const mock_alert_box = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_alert_box);
                
                expect(handleResponseRemoveAllStudents({message: 'message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_all_students_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#remove_all_students_alert_box']);

                expect(mock_alert_box).toEqual({innerHTML: 'message', style: {display: 'block'}});
            });
        });

        describe('>populateRemoveAllStudentsModal', () => {
            it('should be defined', () => {
                expect(populateRemoveAllStudentsModal).toBeDefined();
            });

            it('should populate the span with the name of the selected class', () => {
                const mock_element = {
                    innerText: 'original_contents',
                    style: {
                        display: 'block'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_element, {textContent: 'some_class_name'});

                expect(populateRemoveAllStudentsModal({message: 'message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_all_students_classname']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#class_selector option:checked']);

                expect(mock_element).toEqual({innerText: 'some_class_name', style: {display: 'block'}});
            });
        });

        describe('>RemoveAllConfirmClassname', () => {
            it('should be defined', () => {
                expect(RemoveAllConfirmClassname).toBeDefined();
            });

            it('should disable the submission button if the values do not match', () => {
                const mock_element = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues({textContent: 'some_text_1'}, {value: 'some_text_2'}, mock_element);
                const spy_removeAttribute = spyOn(mock_element, 'removeAttribute').and.stub();
                const spy_setAttribute = spyOn(mock_element, 'setAttribute').and.stub();

                expect(RemoveAllConfirmClassname()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#remove_all_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#remove_all_students_submit']);

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

                expect(RemoveAllConfirmClassname()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector option:checked']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#remove_all_class_confirm']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#remove_all_students_submit']);

                expect(spy_removeAttribute.calls.count()).toEqual(1);
                expect(spy_removeAttribute.calls.argsFor(0)).toEqual(['disabled']);

                expect(spy_setAttribute.calls.count()).toEqual(0);
            });
        })
    });
});