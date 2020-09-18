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
    });
});