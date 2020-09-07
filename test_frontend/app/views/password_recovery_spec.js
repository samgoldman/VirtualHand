define(['app/views/password_recovery'], 
    password_recovery => {
        const mock_socket = {
            emit: () => {}
        };

        beforeEach(() => {
            socket = mock_socket;
        });

        describe ('password_recovery', () => {
            describe('>recoverPassCallback', () => {
                it('should alert the user with the given message', () => {
                    expect(recoverPassCallback).toBeDefined();
                    
                    const spy_alert = spyOn(window, 'alert').and.returnValue(undefined);
        
                    ['Test1', 'Test2', 'RandomMessage'].forEach(message => {
                        spy_alert.calls.reset();
        
                        expect(recoverPassCallback({message: message})).toBeUndefined();
        
                        expect(spy_alert.calls.count()).toEqual(1);
                        expect(spy_alert.calls.argsFor(0)).toEqual([message]);
                    });
                });
            });

            describe('>recoverPass', () => {
                it('should retrieve the submitted username and emit a password recovery request', () => {
                    expect(recoverPass).toBeDefined();

                    const spy_querySelector = spyOn(document, 'querySelector').and.returnValue({value: 'test_value'});
                    const spy_emit = spyOn(socket, 'emit').and.returnValue(undefined);

                    expect(recoverPass()).toBeUndefined();

                    expect(spy_querySelector.calls.count()).toEqual(1);
                    expect(spy_querySelector.calls.argsFor('0').length).toEqual(1);
                    expect(spy_querySelector.calls.argsFor(0)[0]).toEqual('#username');

                    expect(spy_emit.calls.count()).toEqual(1);
                    expect(spy_emit.calls.argsFor(0).length).toEqual(3);
                    expect(spy_emit.calls.argsFor(0)[0]).toEqual('Request_RecoverPassword');
                    expect(spy_emit.calls.argsFor(0)[1]).toEqual({user_name: 'test_value'});
                    expect(spy_emit.calls.argsFor(0)[2]).toEqual(recoverPassCallback);
                });
            });
        });
        
    }
);