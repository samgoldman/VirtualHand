const pug = require('pug');
const fs = require('fs');
const rewire = require('rewire');
const routes = rewire('../../app/routes.js');
const path = require('path');
const Token = require('../../app/token_manager');
const Course = require('../../app/models/course').model;

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

    describe('>handle_home', () => {
        it('should be defined', () => {
            expect(routes.__get__('handle_home')).toBeDefined();
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

                expect(routes.__get__('handle_home')(mock_req, mock_res)).toBeUndefined();

                expect(spy_redirect.calls.count()).toEqual(1);
                expect(spy_redirect.calls.argsFor(0)).toEqual([`/${role}/home`])
            });
        });
    });

    describe('>handle_login', () => {
        const handle_login = routes.__get__('handle_login');

        it('should be defined', () => {
            expect(handle_login).toBeDefined();
        });

        it('should render the template with the flash message and send it', () => {
            const mock_req = {
                flash: () => 'flash_message'
            };

            const mock_res = {
                send: () => undefined
            };

            const renderFile_original = routes.__get__('renderFile');

            const spy_flash = spyOn(mock_req, 'flash').and.callThrough();
            const spy_send = spyOn(mock_res, 'send').and.callThrough();
            const spy_renderFile = jasmine.createSpy('renderFile').and.returnValue('rendered_value');
            routes.__set__('renderFile', spy_renderFile);

            expect(handle_login(mock_req, mock_res)).toBeUndefined();

            expect(spy_flash.calls.count()).toEqual(1);
            expect(spy_flash.calls.argsFor(0)).toEqual(['loginMessage']);

            expect(spy_send.calls.count()).toEqual(1);
            expect(spy_send.calls.argsFor(0)).toEqual(['rendered_value']);

            expect(spy_renderFile.calls.count()).toEqual(1);
            expect(spy_renderFile.calls.argsFor(0)).toEqual(['./app/views/login.pug', {message: 'flash_message'}]);

            routes.__set__('renderFile', renderFile_original);
        });
    });

    describe('>handle_signup_get', () => {
        const handle_signup_get = routes.__get__('handle_signup_get');

        it('should be defined', () => {
            expect(handle_signup_get).toBeDefined();
        });

        it('should render the template with the flash message and send it', () => {
            const mock_req = {
                flash: () => 'flash_message'
            };

            const mock_res = {
                send: () => undefined
            };

            const renderFile_original = routes.__get__('renderFile');

            const spy_flash = spyOn(mock_req, 'flash').and.callThrough();
            const spy_send = spyOn(mock_res, 'send').and.callThrough();
            const spy_renderFile = jasmine.createSpy('renderFile').and.returnValue('rendered_value');
            routes.__set__('renderFile', spy_renderFile);

            expect(handle_signup_get(mock_req, mock_res)).toBeUndefined();

            expect(spy_flash.calls.count()).toEqual(1);
            expect(spy_flash.calls.argsFor(0)).toEqual(['signupMessage']);

            expect(spy_send.calls.count()).toEqual(1);
            expect(spy_send.calls.argsFor(0)).toEqual(['rendered_value']);

            expect(spy_renderFile.calls.count()).toEqual(1);
            expect(spy_renderFile.calls.argsFor(0)).toEqual(['./app/views/signup.pug', {message: 'flash_message'}]);

            routes.__set__('renderFile', renderFile_original);
        });
    });
    
    describe('>handle_logout', () => {
        const handle_logout = routes.__get__('handle_logout');

        it('should be defined', () => {
            expect(handle_logout).toBeDefined();
        });

        it('should log the user out and redirect the user home', () => {
            const mock_req = {
                logout: () => undefined
            };

            const mock_res = {
                redirect: () => undefined
            };

            const spy_logout = spyOn(mock_req, 'logout').and.callThrough();
            const spy_redirect = spyOn(mock_res, 'redirect').and.callThrough();

            expect(handle_logout(mock_req, mock_res)).toBeUndefined();

            expect(spy_logout.calls.count()).toEqual(1);
            expect(spy_logout.calls.argsFor(0)).toEqual([]);
            
            expect(spy_redirect.calls.count()).toEqual(1);
            expect(spy_redirect.calls.argsFor(0)).toEqual(['/']);
        });
    });

    describe('>handle_notification_audio', () => {
        const handle_notification_audio = routes.__get__('handle_notification_audio');

        it('should be defined', () => {
            expect(handle_notification_audio).toBeDefined();
        });

        it('should set the content type and stream the audio', () => {
            const mock_res = {
                set: () => undefined
            };

            const mock_stream = {
                pipe: () => undefined
            };

            const spy_join = spyOn(path, 'join').and.returnValue('joined_path');
            const spy_createReadStream = spyOn(fs, 'createReadStream').and.returnValue(mock_stream);
            const spy_pipe = spyOn(mock_stream, 'pipe').and.returnValue(undefined);
            const spy_set = spyOn(mock_res, 'set').and.returnValue(undefined);

            expect(handle_notification_audio(undefined, mock_res)).toBeUndefined();

            expect(spy_join.calls.count()).toEqual(1);
            expect(spy_join.calls.argsFor(0).length).toEqual(2);
            expect(spy_join.calls.argsFor(0)[1]).toEqual('../client/static/ding.wav');

            expect(spy_createReadStream.calls.count()).toEqual(1);
            expect(spy_createReadStream.calls.argsFor(0)).toEqual(['joined_path']);

            expect(spy_pipe.calls.count()).toEqual(1);
            expect(spy_pipe.calls.argsFor(0)).toEqual([mock_res]);

            expect(spy_set.calls.count()).toEqual(1);
            expect(spy_set.calls.argsFor(0)).toEqual([{'Content-Type': 'audio/mpeg'}]);
        });
    });

    describe('>handle_recoverpassword', () => {
        const handle_recoverpassword = routes.__get__('handle_recoverpassword');

        it('should be defined', () => {
            expect(handle_recoverpassword).toBeDefined();
        });

        it('should render the file with an empty token', () => {
            const mock_res = {
                send: () => undefined
            };

            const renderFile_original = routes.__get__('renderFile');

            const spy_send = spyOn(mock_res, 'send').and.callThrough();
            const spy_renderFile = jasmine.createSpy('renderFile').and.returnValue('rendered_value');
            routes.__set__('renderFile', spy_renderFile);
            const spy_getSocketToken = spyOn(Token, 'getSocketToken').and.returnValue('token_value');

            expect(handle_recoverpassword(undefined, mock_res)).toBeUndefined();

            expect(spy_send.calls.count()).toEqual(1);
            expect(spy_send.calls.argsFor(0)).toEqual(['rendered_value']);

            expect(spy_renderFile.calls.count()).toEqual(1);
            expect(spy_renderFile.calls.argsFor(0)).toEqual(['./app/views/password_recovery.pug', {token: 'token_value'}]);

            expect(spy_getSocketToken.calls.count()).toEqual(1);
            expect(spy_getSocketToken.calls.argsFor(0)).toEqual([null]);

            routes.__set__('renderFile', renderFile_original);
        });
    });

    describe('>renderFile', () => {
        const renderFile = routes.__get__('renderFile');

        it('should be defined', () => {
            expect(renderFile).toBeDefined();
        });

        it('should return the value from compiledTemplates if VH_ENV is not DEVELOPMENT', () => {
            const compiledTemplates_original = routes.__get__('compiledTemplates');
            const templates = {
                val1: () => 'val2',
                val3: () => 'val4' 
            };

            routes.__set__('compiledTemplates', templates);

            const VH_ENV_original = process.env.VH_ENV;
            process.env.VH_ENV = 'NOT_DEVELOPMENT';

            const spy_renderFile_pug = spyOn(pug, 'renderFile').and.returnValue('val5');
            const spy_val1 = spyOn(templates, 'val1').and.callThrough();
            const spy_val3 = spyOn(templates, 'val3').and.callThrough();
            
            expect(renderFile('val1', 'random_data')).toEqual('val2');

            expect(spy_renderFile_pug.calls.count()).toEqual(0);

            expect(spy_val1.calls.count()).toEqual(1);
            expect(spy_val1.calls.argsFor(0)).toEqual(['random_data']);

            expect(spy_val3.calls.count()).toEqual(0);
            
            routes.__set__('compiledTemplates', compiledTemplates_original);
            process.env.VH_ENV = VH_ENV_original;
        });

        it('should render the file fresh if VH_ENV is DEVELOPMENT', () => {
            const compiledTemplates_original = routes.__get__('compiledTemplates');
            const templates = {
                val1: () => 'val2',
                val3: () => 'val4' 
            };

            routes.__set__('compiledTemplates', templates);

            const VH_ENV_original = process.env.VH_ENV;
            process.env.VH_ENV = 'DEVELOPMENT';

            const spy_renderFile_pug = spyOn(pug, 'renderFile').and.returnValue('val5');
            const spy_val1 = spyOn(templates, 'val1').and.callThrough();
            const spy_val3 = spyOn(templates, 'val3').and.callThrough();
            
            expect(renderFile('val1', 'random_data')).toEqual('val5');

            expect(spy_renderFile_pug.calls.count()).toEqual(1);
            expect(spy_renderFile_pug.calls.argsFor(0)).toEqual(['val1', 'random_data', undefined]);

            expect(spy_val1.calls.count()).toEqual(0);

            expect(spy_val3.calls.count()).toEqual(0);

            routes.__set__('compiledTemplates', compiledTemplates_original);
            process.env.VH_ENV = VH_ENV_original;
        });
    });

    describe('>get_teacher_data', () => {
        const get_teacher_data = routes.__get__('get_teacher_data');

        it('should be defined', () => {
            expect(get_teacher_data).toBeDefined();
        });

        it('should retrieve the teacher\'s courses and a token and return the data', async () => {
            const mock_user = {
                _id: 'user_id'
            };

            const spy_taughtBy = spyOn(Course, 'taughtBy').and.returnValue(new Promise(done => done('taughtBy_return_value')));
            const spy_getSocketToken = spyOn(Token, 'getSocketToken').and.returnValue('token_value');

            expect(await get_teacher_data(mock_user)).toEqual({
                user: mock_user,
                courses: 'taughtBy_return_value',
                token: 'token_value'
            });

            expect(spy_taughtBy.calls.count()).toEqual(1);
            expect(spy_taughtBy.calls.argsFor(0)).toEqual(['user_id']);

            expect(spy_getSocketToken.calls.count()).toEqual(1);
            expect(spy_getSocketToken.calls.argsFor(0)).toEqual([mock_user]);

            expect(mock_user._id).toEqual('user_id'); // Just make sure it hasn't changed
        });
    });

    describe('>handle_teacher_home', () => {
        const handle_teacher_home = routes.__get__('handle_teacher_home');

        it('should be defined', () => {
            expect(handle_teacher_home).toBeDefined();
        });

        it('should render and send the pug file', async () => {
            const mock_res = {
                send: () => undefined
            };

            const mock_req = {
                user: 'user_value'
            };

            const renderFile_original = routes.__get__('renderFile');
            const get_teacher_data_original = routes.__get__('get_teacher_data');

            const spy_send = spyOn(mock_res, 'send').and.callThrough();
            const spy_renderFile = jasmine.createSpy('renderFile').and.returnValue('rendered_value');
            routes.__set__('renderFile', spy_renderFile);
            const spy_get_teacher_data = jasmine.createSpy('get_teacher_home').and.returnValue(new Promise(done => done('teacher_data')));
            routes.__set__('get_teacher_data', spy_get_teacher_data);

            expect(await handle_teacher_home(mock_req, mock_res)).toBeUndefined();
            
            expect(spy_send.calls.count()).toEqual(1);
            expect(spy_send.calls.argsFor(0)).toEqual(['rendered_value']);

            expect(spy_renderFile.calls.count()).toEqual(1);
            expect(spy_renderFile.calls.argsFor(0)).toEqual(['./app/views/teacher/teacher_home.pug', 'teacher_data']);
           
            expect(spy_get_teacher_data.calls.count()).toEqual(1);
            expect(spy_get_teacher_data.calls.argsFor(0)).toEqual([mock_req.user]);

            routes.__set__('renderFile', renderFile_original);
            routes.__set__('get_teacher_data', get_teacher_data_original);
        });
    });

    describe('>handle_teacher_hallpass', () => {
        const handle_teacher_hallpass = routes.__get__('handle_teacher_hallpass');

        it('should be defined', () => {
            expect(handle_teacher_hallpass).toBeDefined();
        });

        it('should render and send the pug file', async () => {
            const mock_res = {
                send: () => undefined
            };

            const mock_req = {
                user: 'user_value'
            };

            const renderFile_original = routes.__get__('renderFile');
            const get_teacher_data_original = routes.__get__('get_teacher_data');

            const spy_send = spyOn(mock_res, 'send').and.callThrough();
            const spy_renderFile = jasmine.createSpy('renderFile').and.returnValue('rendered_value');
            routes.__set__('renderFile', spy_renderFile);
            const spy_get_teacher_data = jasmine.createSpy('get_teacher_home').and.returnValue(new Promise(done => done('teacher_data')));
            routes.__set__('get_teacher_data', spy_get_teacher_data);

            expect(await handle_teacher_hallpass(mock_req, mock_res)).toBeUndefined();
            
            expect(spy_send.calls.count()).toEqual(1);
            expect(spy_send.calls.argsFor(0)).toEqual(['rendered_value']);

            expect(spy_renderFile.calls.count()).toEqual(1);
            expect(spy_renderFile.calls.argsFor(0)).toEqual(['./app/views/teacher/teacher_hall_pass.pug', 'teacher_data']);
           
            expect(spy_get_teacher_data.calls.count()).toEqual(1);
            expect(spy_get_teacher_data.calls.argsFor(0)).toEqual([mock_req.user]);

            routes.__set__('renderFile', renderFile_original);
            routes.__set__('get_teacher_data', get_teacher_data_original);
        });
    });
});