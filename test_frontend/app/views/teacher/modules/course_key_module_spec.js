define((require) => {

    describe('course_key_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/course_key_module');
        });

        describe('>CourseKeyModuleInit', () => {
            it('should be defined', () => {
                expect(CourseKeyModuleInit).toBeDefined();
            });

            it('should setup event listeners and socket handlers', () => {
                const mock_socket = {
                    on: () => undefined
                };
                socket = mock_socket;

                const mock_element = {
                    addEventListener: () => undefined
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_on = spyOn(mock_socket, 'on').and.callThrough();
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();

                expect(CourseKeyModuleInit()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_key_button']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#new_key_button']);

                expect(spy_addEventListener.calls.count()).toEqual(2);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', RequestKey]);
                expect(spy_addEventListener.calls.argsFor(1)).toEqual(['click', RequestNewKey]);

                expect(spy_on.calls.count()).toEqual(2);
                expect(spy_on.calls.argsFor(0)).toEqual(['Response_AssignNewCourseKey', RequestKey]);
                expect(spy_on.calls.argsFor(1)).toEqual(['Response_RetrieveCourseKey', HandleResponseRetrieveCourseKey]);
            });
        });

        [{f: RequestKey, fname: 'RequestKey', event: 'Request_RetrieveCourseKey'}, {f: RequestNewKey, fname: 'RequestNewKey', event: 'Request_AssignNewCourseKey'}].forEach(testCase => {
            const {f, fname, event} = testCase;
            describe(`>${fname}`, () => {
                it('should be defined', () => {
                    expect(f).toBeDefined();
                });

                it('should emit the appropriate event with the currently selected course_id', () => {
                   const mock_socket = {
                       emit: () => undefined
                   };
                   socket = mock_socket;

                   const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                   const currentlySelected = Math.floor(Math.random() * 100);
                   const spy_getSelectedClassId = spyOn(window, 'getSelectedClassId').and.returnValue(currentlySelected);

                   expect(f()).toBeUndefined();

                   expect(spy_getSelectedClassId.calls.count()).toEqual(1);
                   expect(spy_getSelectedClassId.calls.argsFor(0)).toEqual([]);

                   expect(spy_emit.calls.count()).toEqual(1);
                   expect(spy_emit.calls.argsFor(0)).toEqual([event, {cid: currentlySelected}]);
                });
            })
        });
    });
});