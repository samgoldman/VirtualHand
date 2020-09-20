define((require) => {

    describe('class_selector', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/class_selector');
        });

        describe('>ClassSelectorInit_Teacher', () => {
            it('should be defined', () => {
                expect(ClassSelectorInit_Teacher).toBeDefined();
            });

            it('>should call sortClasses and set UpdateManagementButtons as an event listener for class_selector changing', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };
                
                const spy_sortClasses = spyOn(window, 'sortClasses').and.returnValue(undefined);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();

                expect(ClassSelectorInit_Teacher()).toBeUndefined();

                expect(spy_sortClasses.calls.count()).toEqual(1);
                expect(spy_sortClasses.calls.argsFor(0)).toEqual([]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', UpdateManagementButtons]);
            });
        });
    });
});