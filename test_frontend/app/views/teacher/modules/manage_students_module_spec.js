define((require) => {

    describe('manage_students_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/manage_students_module');
        });

        describe('>clearManageStudentsModal', () => {
            it('should be defined', () => {
                expect(clearManageStudentsModal).toBeDefined();
            });

            it('should clear+hide the alert box', () => {
                const mock_alert_box = {
                    style: {display: 'block'},
                    innerText: 'original_alert'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_alert_box);

                expect(clearManageStudentsModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#manage_students_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#manage_students_alert_box']);

                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerText: ''});
            });
        });

        describe('>handleResponseChangeStudentPassword', () => {
            it('should be defined', () => {
                expect(handleResponseChangeStudentPassword).toBeDefined();
            });

            it('should clear+hide the alert box', () => {
                const mock_alert_box = {
                    style: {display: 'none'},
                    innerText: ''
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_alert_box);

                expect(handleResponseChangeStudentPassword({message: 'success message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#manage_students_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#manage_students_alert_box']);

                expect(mock_alert_box).toEqual({style: {display: 'block'}, innerText: 'success message'});
            });
        });

        describe('>RequestStudents', () => {
            it('should be defined', () => {
                expect(RequestStudents).toBeDefined();
            });

            it('should send the request to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_class_id');

                expect(RequestStudents()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_StudentsForClass', {cid: 'test_class_id'}]);

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>RemoveStudent', () => {
            it('should be defined', () => {
                expect(RemoveStudent).toBeDefined();
            });

            it('should send the request to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_class_id');
                const spy_getSelectedStudentOption = spyOn(window, 'getSelectedStudentOption').and.returnValue({value: 'test_value'})

                expect(RemoveStudent()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_RemoveStudent', {cid: 'test_class_id', sid: 'test_value'}]);

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_getSelectedStudentOption.calls.count()).toEqual(1);
                expect(spy_getSelectedStudentOption.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>AdmitStudent', () => {
            it('should be defined', () => {
                expect(AdmitStudent).toBeDefined();
            });

            it('should send the request to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('test_class_id');
                const spy_getSelectedStudentOption = spyOn(window, 'getSelectedStudentOption').and.returnValue({value: 'test_value'})

                expect(AdmitStudent()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_AdmitStudent', {cid: 'test_class_id', sid: 'test_value'}]);

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                expect(spy_getSelectedStudentOption.calls.count()).toEqual(1);
                expect(spy_getSelectedStudentOption.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>initManageStudentsModule', () => {
            it('should be defined', () => {
                expect(initManageStudentsModule).toBeDefined();
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

                expect(initManageStudentsModule()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(5);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#student_selector']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#manage_students_button']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#remove_student']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#admit_student']);
                expect(spy_querySelector.calls.argsFor(4)).toEqual(['#new_student_pw_submit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.manage-students-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', clearManageStudentsModal]);

                expect(spy_addEventListener.calls.count()).toEqual(5);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', StudentSelectorChanged]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['click', RequestStudents]);
                expect(spy_addEventListener.calls.argsFor(2)).toEqual(['click', RemoveStudent]);
                expect(spy_addEventListener.calls.argsFor(3)).toEqual(['click', AdmitStudent]);
                expect(spy_addEventListener.calls.argsFor(4)).toEqual(['click', changeStudentPassword]);

                expect(spy_socket_on.calls.count()).toEqual(4);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_ChangeStudentPassword', handleResponseChangeStudentPassword]);
                expect(spy_socket_on.calls.argsFor(1)).toEqual(['Response_AdmitStudent', RequestStudents]);
                expect(spy_socket_on.calls.argsFor(2)).toEqual(['Response_RemoveStudent', RequestStudents]);
                expect(spy_socket_on.calls.argsFor(3)).toEqual(['Response_StudentsForClass', handleReponseGetStudents]);
            });
        });

        describe('>StudentSelectorChanged', () => {
            it('should be defined', () => {
                expect(StudentSelectorChanged).toBeDefined();
            });

            it('should enable the remove student and change student password and disable admit student if the student is admitted', () => {
                const mock_element = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_removeAttribute = spyOn(mock_element, 'removeAttribute').and.stub();
                const spy_setAttribute = spyOn(mock_element, 'setAttribute').and.stub();
                const spy_getSelectedStudentOption = spyOn(window, 'getSelectedStudentOption').and.returnValue({className: 'someclass'})

                expect(StudentSelectorChanged()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(4);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_student']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#new_student_pw']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#new_student_pw_submit']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#admit_student']);

                expect(spy_removeAttribute.calls.count()).toEqual(3);
                expect(spy_removeAttribute.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_removeAttribute.calls.argsFor(1)).toEqual(['disabled']);
                expect(spy_removeAttribute.calls.argsFor(2)).toEqual(['disabled']);

                expect(spy_setAttribute.calls.count()).toEqual(1);
                expect(spy_setAttribute.calls.argsFor(0)).toEqual(['disabled', 'disabled']);

                expect(spy_getSelectedStudentOption).toHaveBeenCalledTimes(1);
                expect(spy_getSelectedStudentOption).toHaveBeenCalledWith();
            });
            
            it('should enable the remove student, disable change student password and enable admit student if the student is not admitted', () => {
                const mock_element = {
                    removeAttribute: () => undefined,
                    setAttribute: () => undefined
                }

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_removeAttribute = spyOn(mock_element, 'removeAttribute').and.stub();
                const spy_setAttribute = spyOn(mock_element, 'setAttribute').and.stub();
                const spy_getSelectedStudentOption = spyOn(window, 'getSelectedStudentOption').and.returnValue({className: 'someclass not-admitted otherclass'})

                expect(StudentSelectorChanged()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(4);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#remove_student']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#new_student_pw']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#new_student_pw_submit']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#admit_student']);

                expect(spy_removeAttribute.calls.count()).toEqual(2);
                expect(spy_removeAttribute.calls.argsFor(0)).toEqual(['disabled']);
                expect(spy_removeAttribute.calls.argsFor(1)).toEqual(['disabled']);

                expect(spy_setAttribute.calls.count()).toEqual(2);
                expect(spy_setAttribute.calls.argsFor(0)).toEqual(['disabled', 'disabled']);
                expect(spy_setAttribute.calls.argsFor(1)).toEqual(['disabled', 'disabled']);

                expect(spy_getSelectedStudentOption).toHaveBeenCalledTimes(1);
                expect(spy_getSelectedStudentOption).toHaveBeenCalledWith();
            });
        });

        describe('>getSelectedStudentOption', () => {
            it('should be defined', () => {
                expect(getSelectedStudentOption).toBeDefined();
            });

            it('should return the result of a query for the selected option', () => {
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue('some_value_here');

                expect(getSelectedStudentOption()).toEqual('some_value_here');

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#student_selector option:checked']);
            });
        });
    });
});