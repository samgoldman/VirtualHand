define((require) => {

    describe('enroll_module', () => {
        beforeEach(() => {
            require('app/views/student/modules/enroll_module');
            const mock_socket = {
                on: () => undefined,
                emit: () => undefined
            };
            socket = mock_socket;
        });

        describe('>EnrollModuleInit', () => {
            it('should be defined', () => {
                expect(EnrollModuleInit).toBeDefined();
            });

            it('should setup event listeners and socket.io handlers', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };

                const spy_on = spyOn(socket, 'on').and.returnValue(undefined);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.returnValue(undefined);

                expect(EnrollModuleInit()).toBeUndefined();

                expect(spy_on.calls.count()).toEqual(1);
                expect(spy_on.calls.argsFor(0)).toEqual(['Response_EnrollStudent', handleEnrollStudentResponse]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#enroll_submit']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', EnrollClicked]);
            });
        });

        describe('>handleEnrollStudentResponse', () => {
            it('should be defined', () => {
                expect(handleEnrollStudentResponse).toBeDefined();
            });

            it('should set the alert box message and display it', () => {
                const mock_element = {
                    innerHTML: "original_message",
                    style: {
                        display: "none"
                    }
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(handleEnrollStudentResponse({message: 'Hello world!'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#enroll_alert_box']);
                
                expect(mock_element).toEqual({
                    innerHTML: 'Hello world!',
                    style: {
                        display: 'block'
                    }
                });
            });
        });

        describe('>EnrollClicked', () => {
            it('should be defined', () => {
                expect(EnrollClicked).toBeDefined();
            });

            it('should send the entered course key to the server', () => {
                const spy_emit = spyOn(socket, 'emit').and.returnValue(undefined);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue({
                    value: 'random_key'
                });

                expect(EnrollClicked()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_EnrollStudent', {courseKey: 'random_key'}]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#course_key']);
            });
        });
    });
});