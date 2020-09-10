define((require) => {

    describe('class_selector', () => {
        beforeEach(() => {
            require('app/views/student/modules/class_selector');
        });

        describe('>ClassSelectorInit', () => {
            it('should be defined', () => {
                expect(ClassSelectorInit).toBeDefined();
            });

            it('>should call sortClasses and set ClassSelectorChanged as an event listener for class_selector changing', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };
                
                const spy_sortClasses = spyOn(window, 'sortClasses').and.returnValue(undefined);
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();

                expect(ClassSelectorInit()).toBeUndefined();

                expect(spy_sortClasses.calls.count()).toEqual(1);
                expect(spy_sortClasses.calls.argsFor(0)).toEqual([]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['change', ClassSelectorChanged]);
            });
        });

        describe('>ClassSelectorChanged', () => {
            it('>should be defined', () => {
                expect(ClassSelectorChanged).toBeDefined();
            });

            it('>should call sortClasses', () => {
                const spy_sortClasses = spyOn(window, 'sortClasses').and.returnValue(undefined);
                
                expect(ClassSelectorChanged()).toBeUndefined();

                expect(spy_sortClasses.calls.count()).toEqual(1);
                expect(spy_sortClasses.calls.argsFor(0)).toEqual([]);
                
            });
        });

        describe('>getSelectedClassId', () => {
            it('should be defined', () => {
                expect(getSelectedClassId).toBeDefined();
            });

            [
                {options: [], expected: undefined},
                {options: [new Option('t', 'v1', false, false)], expected: undefined},
                {options: [new Option('t', 'v2', false, true)], expected: 'v2'},
                {options: [new Option('t', 'v3', true, false)], expected: undefined},
                {options: [new Option('t', 'v4', true, true)], expected: 'v4'},
                {options: [new Option('t', 'v5', false, false), new Option('t', 'v6', false, false)], expected: undefined},
                {options: [new Option('t', 'v7', false, true), new Option('t', 'v8', false, false)], expected: 'v7'},
                {options: [new Option('t', 'v9', false, false), new Option('t', 'v10', false, true)], expected: 'v10'},
                {options: [new Option('t', 'v11', false, true), new Option('t', 'v12', false, true)], expected: 'v12'}
            ].forEach(testCase => {
                it('should return the last option that selected or undefined if no such option', () => {
                    const mock_element = {
                        querySelector: () => undefined
                    };

                    const spy_document_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                    const spy_element_querySelector = spyOn(mock_element, 'querySelector').and.returnValue(testCase.options);

                    expect(getSelectedClassId()).toEqual(testCase.expected);

                    expect(spy_document_querySelector).toHaveBeenCalledTimes(1);
                    expect(spy_document_querySelector.calls.argsFor(0)).toEqual(['#class_selector']);
                    
                    expect(spy_element_querySelector).toHaveBeenCalledTimes(1);
                    expect(spy_element_querySelector.calls.argsFor(0)).toEqual(['option']);
                });
            });
        });
    });
});