const pug = require('pug');
const fs = require('fs');
const rewire = require('rewire');
const routes = rewire('../../app/routes.js');

describe('routes', () => {
    describe('>main', () => {
        it('should be defined', () => {
            expect(routes).toBeDefined();
        });

        it('should compile all templates and initialize all routes', () => {
            const mock_app = {
                get: () => undefined,
                post: () => undefined
            };

            const mock_passport = {
                authenticate: () => 'authenticate_return'
            };

            const spy_writeFileSync = spyOn(fs, 'writeFileSync').and.returnValue(undefined);
            const spy_compileFileClient = spyOn(pug, 'compileFileClient').and.returnValue('compiled_file_data');
            const spy_compileFile = spyOn(pug, 'compileFile').and.returnValues('cf1', 'cf2', 'cf3', 'cf4', 'cf5', 'cf6', 'cf7', 'cf8');
            const spy_get = spyOn(mock_app, 'get').and.returnValue(undefined);
            const spy_post = spyOn(mock_app, 'post').and.returnValue(undefined);
            const spy_authenticate = spyOn(mock_passport, 'authenticate').and.callThrough();

            expect(routes(mock_app, mock_passport)).toBeUndefined();

            expect(spy_writeFileSync.calls.count()).toEqual(1);
            expect(spy_writeFileSync.calls.argsFor(0)).toEqual(['./app/views/teacher/modules/hall_pass_list_item_template_compiled.js', 'compiled_file_data']);

            expect(spy_compileFileClient.calls.count()).toEqual(1);
            expect(spy_compileFileClient.calls.argsFor(0)).toEqual(['./app/views/teacher/modules/hall_pass_list_item_template.pug', {name: 'listItemTemplate'}]);

            //TODO Expanded testing
            expect(spy_compileFile.calls.count()).toEqual(8);
            expect(spy_compileFile.calls.argsFor(0)).toEqual(['./app/views/student/student_home.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(1)).toEqual(['./app/views/teacher/teacher_home.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(2)).toEqual(['./app/views/teacher/teacher_hall_pass.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(3)).toEqual(['./app/views/login.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(4)).toEqual(['./app/views/signup.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(5)).toEqual(['./app/views/password_recovery.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(6)).toEqual(['./app/views/teacher/teacher_history_hall_pass.pug', undefined]);
            expect(spy_compileFile.calls.argsFor(7)).toEqual(['./app/views/teacher/teacher_history_assistance_request.pug', undefined]);

            //TODO improve testing for get and post
            expect(spy_get.calls.count()).toEqual(11);
            expect(spy_get.calls.argsFor(0)[0]).toEqual('/home');
            expect(spy_get.calls.argsFor(1)[0]).toEqual('/teacher/home');
            expect(spy_get.calls.argsFor(2)[0]).toEqual('/teacher/hallpass');
            expect(spy_get.calls.argsFor(3)[0]).toEqual('/teacher/history/hallpass/:cid');
            expect(spy_get.calls.argsFor(4)[0]).toEqual('/teacher/history/assistancerequest/:cid');
            expect(spy_get.calls.argsFor(5)[0]).toEqual('/student/home');
            expect(spy_get.calls.argsFor(6)[0]).toEqual('/logout');
            expect(spy_get.calls.argsFor(7)[0]).toEqual(['/', '/login']);
            expect(spy_get.calls.argsFor(8)[0]).toEqual('/signup');
            expect(spy_get.calls.argsFor(9)[0]).toEqual('/recoverpassword');
            expect(spy_get.calls.argsFor(10)[0]).toEqual('/notification_audio');

            expect(spy_post.calls.count()).toEqual(2);
            expect(spy_post.calls.argsFor(0)[0]).toEqual('/login');
            expect(spy_post.calls.argsFor(0)[2]).toEqual('authenticate_return');
            expect(spy_post.calls.argsFor(1)[0]).toEqual('/signup');
            expect(spy_post.calls.argsFor(1)[2]).toEqual('authenticate_return');

            expect(spy_authenticate.calls.count()).toEqual(2);
            expect(spy_authenticate.calls.argsFor(0)).toEqual([
                'local-login', {successRedirect: '/home', failureRedirect: '/login', failureFlash: true}
            ]);
            expect(spy_authenticate.calls.argsFor(1)).toEqual([
                'local-signup', {successRedirect: '/home', failureRedirect: '/signup', failureFlash: true}
            ]);
        });
    });
});