define((require) => {

    describe('add_student_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/add_students_module');
        });

        describe('>clearAddStudentModule', () => {
            it('should be defined', () => {
                expect(clearAddStudentModal).toBeDefined();
            });

            it('should clear the input box and clear+hide the alert box', () => {
                const mock_csv_input = {
                    value: 'original_value',
                    style: {display: 'block'}
                };
                
                const mock_password_input = {
                    value: 'original_password',
                    style: {display: 'block'}
                };

                const mock_alert_box = {
                    style: {display: 'block'},
                    innerHTML: 'original_alert'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_csv_input, mock_password_input, mock_alert_box, mock_alert_box);

                expect(clearAddStudentModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(4);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#addStudentsCSV']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#addStudentsDefaultPassword']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#enrollAlert']);
                expect(spy_querySelector.calls.argsFor(3)).toEqual(['#enrollAlert']);

                expect(mock_csv_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_password_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerHTML: ''});
            });
        });

        describe('>AddStudentClicked', () => {
            it('should be defined', () => {
                expect(AddStudentsClicked).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues({value: 'csv_test'}, {value: 'pass_test'});
                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue('84');

                expect(AddStudentsClicked()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#addStudentsCSV']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#addStudentsDefaultPassword']);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_AddStudents', {cid: '84', csv: 'csv_test', defaultPassword: 'pass_test'}]);

                expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);
            });
        });

        describe('>InitAddStudentModule', () => {
            it('should be defined', () => {
                expect(addStudentsModuleInit).toBeDefined();
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

                expect(addStudentsModuleInit()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#addStudentsSubmit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.add-students-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', clearAddStudentModal]);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', AddStudentsClicked]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_AddStudents', handleResponseAddStudents]);
            });
        });

        describe('>HandleResponseCourseCreate', () => {
            it('should be defined', () => {
                expect(handleResponseAddStudents).toBeDefined()
            });

            it('should add the returned message to the alert box and display it', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(handleResponseAddStudents({message: 'failure message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#enrollAlert']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#enrollAlert']);

                expect(mock_element).toEqual({innerHTML: 'original_contents<p>failure message</p>', style: {display: 'block'}})
            });
        });
    });
});