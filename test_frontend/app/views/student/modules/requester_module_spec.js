describe('requester_module', () => {

    describe('setup', () => {
        it('should register its initialization function as an window load event handler', () => {
            const spy_addEventListener = spyOn(window, 'addEventListener').and.returnValue(undefined);

            define(['app/views/student/modules/requester_module'], 
                class_selector_util => {
                    expect(spy_addEventListener.calls.count()).toEqual(1);
                    expect(spy_addEventListener.calls.argsFor(0).length).toEqual(2);
                    expect(spy_addEventListener.calls.argsFor(0)[0]).toEqual('load');   
                    expect(spy_addEventListener.calls.argsFor(0)[1]).toEqual(RequesterModuleInit);  
                }
            );
        });
    });

});