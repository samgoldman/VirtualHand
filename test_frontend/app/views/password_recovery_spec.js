// const rewire = require('rewire');

define(['app/views/password_recovery'], 
    password_recovery => {

        describe ('password_recovery', () => {
            describe('recoverPassCallback', () => {
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
        });
        
    }
);