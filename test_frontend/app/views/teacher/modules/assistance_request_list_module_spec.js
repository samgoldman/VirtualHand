define((require) => {

    describe('requester_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/assistance_request_list_module');
        });

        define('>RetrieveAssistanceRequests', () => {
            it('should be defined', () => {
                expect(RetrieveAssistanceRequests).toBeDefined();
            });

            [[], ['a'], ['a', 'b', 'random_course_id_42']].forEach(selectedCourseList => {
                it(`should request assistance requests for selected courses (${selectedCourseList})`, () => {
                    const mock_socket = {
                        emit: () => undefined
                    };

                    const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                    const spy_getSelectedClassIds = jasmine.createSpy('getSelectedClassIds').and.returnValue(selectedCourseList);
                    selectedClassIds = spy_getSelectedClassIds;

                    expect(RetrieveAssistanceRequests()).toBeUndefined();

                    expect(spy_emit.calls.count()).toEqual(1);
                    expect(spy_emit.calls.argsFor(0)).toEqual([{cids: selectedCourseList, qty: 5}]);

                    expect(spy_getSelectedClassIds.calls.count()).toEqual(1);
                    expect(spy_emit.calls.argsFor(0)).toEqual([]);
                });
            });
        });
    });
});