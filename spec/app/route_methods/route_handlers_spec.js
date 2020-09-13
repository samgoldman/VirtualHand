const {handle_home} = require('../../../app/route_methods/route_handlers');

describe('route_handlers', () => {
    describe('>handle_home', () => {
        it('should be defined', () => {
            expect(handle_home).toBeDefined();
        });

        ['teacher', 'student'].forEach(role => {
            it(`should redirect to '/${role}/home if the user's role is ${role}`, () => {
                const mock_req = {
                    user: {role: role}
                };

                const mock_res = {
                    redirect: () => undefined
                };

                const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();

                expect(handle_home(mock_req, mock_res)).toBeUndefined();

                expect(spy_redirect.calls.count()).toEqual(1);
                expect(spy_redirect.calls.argsFor(0)).toEqual([`/${role}/home`])
            });
        });
    });
});