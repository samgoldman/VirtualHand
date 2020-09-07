define(['app/views/shared/class_selector_util'], 
    class_selector_util => {
        describe('sortClasses', () => {
            it('should be defined', () => {
                expect(sortClasses).toBeDefined();
            });

            it('should leave the class selector empty if it begins empty', () => {
                const mock_selector = {
                    options: []
                };

                const spy_getElementById = spyOn(document, 'getElementById').and.returnValue(mock_selector);

                expect(sortClasses()).toBeUndefined();

                expect(spy_getElementById.calls.count()).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0).length).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0)[0]).toEqual('class_selector');

                expect(mock_selector.options.length).toEqual(0);
            });
        });
    }
);