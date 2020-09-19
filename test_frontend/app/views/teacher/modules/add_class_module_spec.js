define((require) => {

    describe('add_class_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/add_class_module');
        });

        describe('>ClearAddClassModule', () => {
            it('should be defined', () => {
                expect(ClearAddClassModal).toBeDefined();
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

                expect(ClearAddClassModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#new_class_name']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#create_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#create_class_alert_box']);

                expect(mock_input).toEqual({value: '', style: {display: 'block'}});
                expect(mock_alert_box).toEqual({style: {display: 'none'}, innerHTML: ''});
            });
        });

        describe('>NewClassClicked', () => {
            it('should be defined', () => {
                expect(NewClassClicked).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue({value: 'test_value'});
                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

                expect(NewClassClicked()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#new_class_name']);

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_CourseCreate', {courseName: 'test_value'}]);
            });
        });

        describe('>InitAddClassModule', () => {
            it('should be defined', () => {
                expect(InitAddClassModule).toBeDefined();
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

                expect(InitAddClassModule()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#new_class_submit']);

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual(['.create-class-modal']);

                expect(spy_jquery_on.calls.count()).toEqual(1);
                expect(spy_jquery_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', ClearAddClassModal]);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', NewClassClicked]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_CourseCreate', HandleResponseCourseCreate]);
            });
        });

        describe('>HandleResponseCourseCreate', () => {
            it('should be defined', () => {
                expect(HandleResponseCourseCreate).toBeDefined()
            });
            
            let spy_AddClass = null;
            beforeAll(() => {
                if (typeof AddClass !== 'undefined') {
                    spy_AddClass = spyOn(window, 'AddClass').and.returnValue(undefined);
                } else {
                    spy_AddClass = jasmine.createSpy('AddClass').and.returnValue(undefined);
                    AddClass = spy_AddClass; 
                }
            });

            beforeEach(() => {
                spy_AddClass.calls.reset();
            });

            it('should not add a class to the selector if the course was not successful', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(HandleResponseCourseCreate({message: 'failure message'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#create_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#create_class_alert_box']);

                expect(spy_AddClass.calls.count()).toEqual(0);
            });

            it('should add a class to the selector if the course was successful', () => {
                const mock_element = {
                    innerHTML: 'original_contents',
                    style: {
                        display: 'none'
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(HandleResponseCourseCreate({message: 'class added successfully', courseId: 'test_cid', courseName: 'xyz'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#create_class_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#create_class_alert_box']);

                expect(spy_AddClass.calls.count()).toEqual(1);
                expect(spy_AddClass.calls.argsFor(0)).toEqual(['test_cid', 'xyz']);
            });
        });
    });
});