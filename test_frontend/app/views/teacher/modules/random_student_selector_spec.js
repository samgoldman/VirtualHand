define((require) => {

    describe('random_student_selector', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/random_student_selector');
        });

        describe('>RequestRandomStudent', () => {
            it('should be defined', () => {
                expect(RequestRandomStudent).toBeDefined();
            });

            it('should send the value to the server', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();

                expect(RequestRandomStudent('abcxyz')).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_RandomStudent', {cid: 'abcxyz'}]);
            });
        });

        describe('>initRandomStudentSelector', () => {
            it('should be defined', () => {
                expect(initRandomStudentSelector).toBeDefined();
            });

            it('should initialize event handlers and socket listeners', () => {
                const mock_querySelector = {
                    addEventListener: () => undefined
                };

                const mock_socket = {
                    on: () => undefined
                };
                socket = mock_socket;

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_querySelector);
                const spy_addEventListener = spyOn(mock_querySelector, 'addEventListener').and.callThrough();
                const spy_socket_on = spyOn(mock_socket, 'on').and.callThrough();

                expect(initRandomStudentSelector()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', UpdateRandomStudentSelector]);

                expect(spy_socket_on.calls.count()).toEqual(1);
                expect(spy_socket_on.calls.argsFor(0)).toEqual(['Response_RandomStudent', handleResponseRandomStudent]);
            });
        });

        describe('>handleResponseRandomStudent', () => {
            it('should be defined', () => {
                expect(handleResponseRandomStudent).toBeDefined()
            });

            it('should set the contents of random_student to the returned value if random_student exists', () => {
                const mock_element = {
                    innerHTML: 'original_contents'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_element, mock_element);

                expect(handleResponseRandomStudent({randomStudentName: 'name 1'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#random_student']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#random_student']);

                expect(mock_element.innerHTML).toEqual('<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: name 1');
            });

            it('should add random_student and the returned value to randomStudentButtons if random_student does not exist', () => {
                const mock_element = {
                    innerHTML: 'original_contents'
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(null, mock_element);

                expect(handleResponseRandomStudent({randomStudentName: 'name 2'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#random_student']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#randomStudentButtons']);

                expect(mock_element.innerHTML).toEqual('original_contents<div id="random_student" class="alert alert-info alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: name 2</div>');
            });
        });
    });
});