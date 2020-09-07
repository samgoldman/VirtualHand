
define((require) => {

    describe('requester_module', () => {
        beforeEach(() => {
            require('app/views/student/modules/requester_module');
        })

        describe('>RequesterModuleInit', () => {
            it('should be defined', async () => {
                expect(RequesterModuleInit).toBeDefined();
            });
        });

        describe('>ding', () => {
            it('should be defined', async () => {
                expect(ding).toBeDefined();
            });

            it('should find the #ding element and play it', () => {
                const mock_element = {
                    play: () => undefined
                };

                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_play = spyOn(mock_element, 'play').and.callThrough();

                expect(ding()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#ding']);

                expect(spy_play.calls.count()).toEqual(1);
                expect(spy_play.calls.argsFor(0)).toEqual([]);
            });
        });

    });
});