define((require) => {

    describe('change_password_module.js', () => {
        beforeEach(() => {
            require('app/views/shared/change_password_module');
        });

        describe('>ChangePassword', () => {
            it('should be defined', () => {
                expect(ChangePassword).toBeDefined();
            });

            it('should send a socket message with the old and new passwords', () => {
                const mock_socket = {
                    emit: () => undefined
                };
                socket = mock_socket;

                const spy_emit = spyOn(mock_socket, 'emit').and.callThrough();
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues({value: 'old_pass_test'}, {value: 'new_pass_test'});

                expect(ChangePassword()).toBeUndefined();

                expect(spy_emit.calls.count()).toEqual(1);
                expect(spy_emit.calls.argsFor(0)).toEqual(['Request_PasswordChange', {oldPassword: 'old_pass_test', newPassword: 'new_pass_test'}, ChangePasswordCallback]);

                expect(spy_querySelector.calls.count()).toEqual(2);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#old_password']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#new_password']);
            });
        });

        describe('>ChangePasswordCallback', () => {
            it('should be defined', () => {
                expect(ChangePasswordCallback).toBeDefined();
            });

            it('should show the user the message returned', () => {
                const mock_element = {
                    innerHTML: "original_message",
                    style: {
                        display: "none"
                    }
                };
               
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);

                expect(ChangePasswordCallback({message: 'random_message_here'})).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#change_password_alert_box']);

                expect(mock_element.innerHTML).toEqual('random_message_here');
                expect(mock_element.style).toEqual({display: 'block'});
            });
        });

        describe('>ClearChangePasswordModal', () => {
            it('should be defined', () => {
                expect(ClearChangePasswordModal).toBeDefined();
            });

            it('should clear and hide the message box and clear the password fields', () => {
                const mock_alert_box = {
                    innerHTML: "original_message",
                    style: {
                        display: "block"
                    }
                };

                const mock_old_pass = {
                    value: 'abcd'
                };

                const mock_new_pass = {
                    value: 'xyz'
                };
               
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValues(mock_alert_box, mock_new_pass, mock_old_pass);

                expect(ClearChangePasswordModal()).toBeUndefined();

                expect(spy_querySelector.calls.count()).toEqual(3);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#change_password_alert_box']);
                expect(spy_querySelector.calls.argsFor(1)).toEqual(['#new_password']);
                expect(spy_querySelector.calls.argsFor(2)).toEqual(['#old_password']);

                expect(mock_alert_box).toEqual({innerHTML: '', style: {display: 'none'}});
                expect(mock_new_pass).toEqual({value: ''});
                expect(mock_old_pass).toEqual({value: ''});
            });
        });

        describe('>ChangePasswordModuleInit', () => {
            it('should be defined', () => {
                expect(ChangePasswordModuleInit).toBeDefined();
            });

            it('should add event listeners', () => {
                const mock_element = {
                    addEventListener: () => undefined
                };
                
                const mock_jquery_result = {
                    on: () => undefined
                }

                const spy_jquery = jasmine.createSpy('$').and.returnValue(mock_jquery_result);
                $ = spy_jquery;
                const spy_querySelector = spyOn(document, 'querySelector').and.returnValue(mock_element);
                const spy_addEventListener = spyOn(mock_element, 'addEventListener').and.callThrough();
                const spy_on = spyOn(mock_jquery_result, 'on').and.callThrough();

                expect(ChangePasswordModuleInit()).toBeUndefined();

                expect(spy_jquery.calls.count()).toEqual(1);
                expect(spy_jquery.calls.argsFor(0)).toEqual([".change-password-modal"]);

                expect(spy_querySelector.calls.count()).toEqual(1);
                expect(spy_querySelector.calls.argsFor(0)).toEqual(['#changePasswordSubmit']);

                expect(spy_addEventListener.calls.count()).toEqual(1);
                expect(spy_addEventListener.calls.argsFor(0)).toEqual(['click', ChangePassword]);

                expect(spy_on.calls.count()).toEqual(1);
                expect(spy_on.calls.argsFor(0)).toEqual(['hidden.bs.modal', ClearChangePasswordModal]);
            });
        });
    });
});