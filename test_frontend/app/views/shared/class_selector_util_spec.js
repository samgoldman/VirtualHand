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

            it('should leave the options in order if they are already in order and preserve selected status', () => {
                const mock_selector = {
                    options: [
                        new Option('A', 'z', false, false),
                        new Option('B', 'y', false, true),
                        new Option('C', 'x', false, false),
                    ]
                };

                const spy_getElementById = spyOn(document, 'getElementById').and.returnValue(mock_selector);

                expect(sortClasses()).toBeUndefined();

                expect(spy_getElementById.calls.count()).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0).length).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0)[0]).toEqual('class_selector');

                expect(mock_selector.options.length).toEqual(3);

                expect(mock_selector.options[0].text).toEqual('A');
                expect(mock_selector.options[0].value).toEqual('z');
                expect(mock_selector.options[0].selected).toEqual(false);
                
                expect(mock_selector.options[1].text).toEqual('B');
                expect(mock_selector.options[1].value).toEqual('y');
                expect(mock_selector.options[1].selected).toEqual(true);

                expect(mock_selector.options[2].text).toEqual('C');
                expect(mock_selector.options[2].value).toEqual('x');
                expect(mock_selector.options[2].selected).toEqual(false);
            });

            it('should alphabetize the options and preserve selected status', () => {
                const mock_selector = {
                    options: [
                        new Option('C', 'x', false, false),
                        new Option('A', 'y', false, false),
                        new Option('B', 'z', false, true)
                    ]
                };

                const spy_getElementById = spyOn(document, 'getElementById').and.returnValue(mock_selector);

                expect(sortClasses()).toBeUndefined();

                expect(spy_getElementById.calls.count()).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0).length).toEqual(1);
                expect(spy_getElementById.calls.argsFor(0)[0]).toEqual('class_selector');

                expect(mock_selector.options.length).toEqual(3);

                expect(mock_selector.options[0].text).toEqual('A');
                expect(mock_selector.options[0].value).toEqual('y');
                expect(mock_selector.options[0].selected).toEqual(false);
                
                expect(mock_selector.options[1].text).toEqual('B');
                expect(mock_selector.options[1].value).toEqual('z');
                expect(mock_selector.options[1].selected).toEqual(true);

                expect(mock_selector.options[2].text).toEqual('C');
                expect(mock_selector.options[2].value).toEqual('x');
                expect(mock_selector.options[2].selected).toEqual(false);
            });
        });
    }
);