const {isLoggedIn, isNotLoggedIn, isTeacher, isStudent} = require('../../../app/route_methods/route_middleware');

describe('route_middleware', () => {
    describe('>isLoggedIn', () => {
        it('should be defined', () => {expect(isLoggedIn).toBeDefined()});

        it('should call next if the user is authenticated', () => {
            const mock_req = {
                isAuthenticated: () => true
            };

            const mock_res = {
                redirect: () => 'some_value'
            };

            const spy_next = jasmine.createSpy('next').and.returnValue('next_return');
            const spy_isAuthenticated = spyOn(mock_req, 'isAuthenticated').and.callThrough();
            const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();
          
            expect(isLoggedIn(mock_req, mock_res, spy_next)).toEqual('next_return');

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0)).toEqual([]);

            expect(spy_isAuthenticated.calls.count()).toEqual(1);
            expect(spy_isAuthenticated.calls.argsFor(0)).toEqual([]);

            expect(spy_redirect.calls.count()).toEqual(0);
        });

        it('should redirect if the user is not authenticated', () => {
            const mock_req = {
                isAuthenticated: () => false 
            };

            const mock_res = {
                redirect: () => 'some_value'
            };

            const spy_next = jasmine.createSpy('next').and.returnValue('next_return');
            const spy_isAuthenticated = spyOn(mock_req, 'isAuthenticated').and.callThrough();
            const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();
          
            expect(isLoggedIn(mock_req, mock_res, spy_next)).toBeUndefined();

            expect(spy_next.calls.count()).toEqual(0);

            expect(spy_isAuthenticated.calls.count()).toEqual(1);
            expect(spy_isAuthenticated.calls.argsFor(0)).toEqual([]);

            expect(spy_redirect.calls.count()).toEqual(1);
            expect(spy_redirect.calls.argsFor(0)).toEqual(['/login']);
        });

    });
    describe('>isNotLoggedIn', () => {
        it('should be defined', () => {expect(isNotLoggedIn).toBeDefined()});

        it('should call next if the user is not authenticated', () => {
            const mock_req = {
                isAuthenticated: () => false 
            };

            const mock_res = {
                redirect: () => 'some_value'
            };

            const spy_next = jasmine.createSpy('next').and.returnValue('next_return');
            const spy_isAuthenticated = spyOn(mock_req, 'isAuthenticated').and.callThrough();
            const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();
          
            expect(isNotLoggedIn(mock_req, mock_res, spy_next)).toEqual('next_return');

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0)).toEqual([]);

            expect(spy_isAuthenticated.calls.count()).toEqual(1);
            expect(spy_isAuthenticated.calls.argsFor(0)).toEqual([]);

            expect(spy_redirect.calls.count()).toEqual(0);
        });

        it('should redirect if the user is authenticated', () => {
            const mock_req = {
                isAuthenticated: () => true 
            };

            const mock_res = {
                redirect: () => 'some_value'
            };

            const spy_next = jasmine.createSpy('next').and.returnValue('next_return');
            const spy_isAuthenticated = spyOn(mock_req, 'isAuthenticated').and.callThrough();
            const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();
          
            expect(isNotLoggedIn(mock_req, mock_res, spy_next)).toBeUndefined();

            expect(spy_next.calls.count()).toEqual(0);

            expect(spy_isAuthenticated.calls.count()).toEqual(1);
            expect(spy_isAuthenticated.calls.argsFor(0)).toEqual([]);

            expect(spy_redirect.calls.count()).toEqual(1);
            expect(spy_redirect.calls.argsFor(0)).toEqual(['/home']);
        });
    });
});