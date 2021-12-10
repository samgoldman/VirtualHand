const rewire = require('rewire');
const nodemailer = require('nodemailer');
const Token = require('../../app/token_manager');

let io = null;

describe('io', () => {
    beforeEach(() => {
        io = rewire('../../app/io');
    });

    describe('>initialization', () => {
        it('should be defined', () => {
            expect(io).toBeDefined();
        });

        it('should initialize transport and setup the socket.io server', () => {
            const original_email = process.env.VH_EMAIL;
            const original_email_pwd = process.env.VH_EMAIL_PASSWORD;

            process.env.VH_EMAIL = 'test_email@test.com';
            process.env.VH_EMAIL_PASSWORD = 'test_password';

            io.__set__('authenticateIO', 'test_value_for_authenticateIO');
            io.__set__('route_connection', 'test_value_for_route_connection');

            const mock_io = {
                use: () => mock_io,
                on: () => mock_io
            };

            const spy_createTransport = spyOn(nodemailer, 'createTransport').and.returnValue('nodemailer_transport');
            const spy_use = spyOn(mock_io, 'use').and.callThrough();
            const spy_on = spyOn(mock_io, 'on').and.callThrough();

            expect(io.__get__('transporter')).toBeNull();

            expect(io(mock_io)).toBeUndefined();

            expect(spy_createTransport.calls.count()).toEqual(1);
            expect(spy_createTransport.calls.argsFor(0).length).toEqual(1);
            expect(spy_createTransport.calls.argsFor(0)[0]).toEqual({
                service: 'gmail',
                auth: {
                    user: 'test_email@test.com',
                    pass: 'test_password'
                }
            });

            expect(spy_use.calls.count()).toEqual(1);
            expect(spy_use.calls.argsFor(0).length).toEqual(1);
            expect(spy_use.calls.argsFor(0)[0]).toEqual('test_value_for_authenticateIO');

            expect(spy_on.calls.count()).toEqual(1);
            expect(spy_on.calls.argsFor(0).length).toEqual(2);
            expect(spy_on.calls.argsFor(0)[0]).toEqual('connection');
            expect(spy_on.calls.argsFor(0)[1]).toEqual('test_value_for_route_connection');

            expect(io.__get__('transporter')).toEqual('nodemailer_transport');

            process.env.VH_EMAIL = original_email;
            process.env.VH_EMAIL_PASSWORD = original_email_pwd;
        });
    });

    describe('>handle_disconnect', () => {
        it('should be defined', () => {
            expect(io.__get__('handle_disconnect')).toBeDefined();
        });

        it('should always decrement userCount once', () => {
            [1, 2, 3, 100].forEach(n => {
                io.__set__('userCount', n);

                expect(io.__get__('handle_disconnect')()).toEqual(n);
                expect(io.__get__('userCount')).toEqual(n - 1);
            });
        });
    });

    describe('>authenticateIO', () => {
        it('should be defined', () => {
            expect(io.__get__('authenticateIO')).toBeDefined();
        });

        it('should validate the token in the handshake and add the decoded data to the socket object if there was no error', () => {
            const mock_socket = {handshake: {query: {token: 'test_token'}}};

            const spy_verifyToken = spyOn(Token, 'verifyToken').and.returnValue(undefined);
            const spy_next = jasmine.createSpy('next').and.returnValue(undefined);

            expect(io.__get__('authenticateIO')(mock_socket, spy_next)).toBeUndefined();

            expect(spy_verifyToken.calls.count()).toEqual(1);
            expect(spy_verifyToken.calls.argsFor(0).length).toEqual(2);
            expect(spy_verifyToken.calls.argsFor(0)[0]).toEqual('test_token');
            const callback = spy_verifyToken.calls.argsFor(0)[1];

            expect(callback(undefined, 'decoded_data')).toBeUndefined();

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0).length).toEqual(0);

            expect(mock_socket.user_data).toEqual('decoded_data');
        });

        it('should call next with an error if the query is not defined', () => {
            const mock_socket = {handshake: {}};

            const spy_verifyToken = spyOn(Token, 'verifyToken').and.returnValue(undefined);
            const spy_next = jasmine.createSpy('next').and.returnValue(undefined);

            expect(io.__get__('authenticateIO')(mock_socket, spy_next)).toBeUndefined();

            expect(spy_verifyToken.calls.count()).toEqual(0);

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0).length).toEqual(1);
            expect(spy_next.calls.argsFor(0)[0].message).toEqual('Authentication Error');

            expect(mock_socket.user_data).toBeUndefined();
        });

        it('should call next with an error if the token is not defined', () => {
            const mock_socket = {handshake: {query: {}}};

            const spy_verifyToken = spyOn(Token, 'verifyToken').and.returnValue(undefined);
            const spy_next = jasmine.createSpy('next').and.returnValue(undefined);

            expect(io.__get__('authenticateIO')(mock_socket, spy_next)).toBeUndefined();

            expect(spy_verifyToken.calls.count()).toEqual(0);

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0).length).toEqual(1);
            expect(spy_next.calls.argsFor(0)[0].message).toEqual('Authentication Error');

            expect(mock_socket.user_data).toBeUndefined();
        });

        it('should validate the token in the handshake and call next with an error if there was an error', () => {
            const mock_socket = {handshake: {query: {token: 'test_token'}}};

            const spy_verifyToken = spyOn(Token, 'verifyToken').and.returnValue(undefined);
            const spy_next = jasmine.createSpy('next').and.returnValue(undefined);

            expect(io.__get__('authenticateIO')(mock_socket, spy_next)).toBeUndefined();

            expect(spy_verifyToken.calls.count()).toEqual(1);
            expect(spy_verifyToken.calls.argsFor(0).length).toEqual(2);
            expect(spy_verifyToken.calls.argsFor(0)[0]).toEqual('test_token');
            const callback = spy_verifyToken.calls.argsFor(0)[1];

            expect(callback('some_error', 'decoded_data')).toBeUndefined();

            expect(spy_next.calls.count()).toEqual(1);
            expect(spy_next.calls.argsFor(0).length).toEqual(1);
            expect(spy_next.calls.argsFor(0)[0].message).toEqual('Authentication Error');

            expect(mock_socket.user_data).toBeUndefined();
        });
    });

    describe('>route_connection', () => {
        let mock_socket = {
            on: () => mock_socket,
            user_data: {role: undefined}
        };
        let spy_on = null;
        let route_connection = null;
        
        beforeEach(() => {
            spy_on = spyOn(mock_socket, 'on').and.callThrough();
            route_connection = io.__get__('route_connection');

            //io.__set__('handle_disconnect', 'handle_disconnect_SET');
        });

        it('should be defined', () => {
            expect(route_connection).toBeDefined();
        });

        [{userCount: 0, expected: 1}, {userCount: 22, expected: 23}].forEach(testCase => {
            it(`should increment userCount from ${testCase.userCount} to ${testCase.expected}, set socket disconnect, and do nothing if the role is not valid`, () => {
                io.__set__('userCount', testCase.userCount);
                mock_socket.user_data.role = undefined;

                expect(route_connection(mock_socket)).toBeUndefined();

                expect(spy_on.calls.count()).toEqual(1);
                expect(spy_on.calls.argsFor(0).length).toEqual(2);
                expect(spy_on.calls.argsFor(0)[0]).toEqual('disconnect');
                expect(spy_on.calls.argsFor(0)[1]).toEqual(io.__get__('handle_disconnect'));

                expect(io.__get__('userCount')).toEqual(testCase.expected);
            });
        });

        [{role: 'guest', expected_events: ['disconnect', 'Request_RecoverPassword']},
         {role: 'admin', expected_events: ['disconnect', 'Request_RecoverPassword', 'Request_PasswordChange']},
         {role: 'student', expected_events: ['disconnect', 'Request_RecoverPassword', 'Request_PasswordChange', 'Request_AssistanceRequestStatus', 'Request_InitiateAssistanceRequest', 'Request_ResolveAssistanceRequest', 'Request_EnrollStudent', 'Request_HallPassRequestStatus', 'Request_InitiateHallPassRequest', 'Request_StudentResolveHallPassRequest']},
         {role: 'teacher', expected_events: ['disconnect', 'Request_RecoverPassword', 'Request_PasswordChange', 'Request_CourseCreate', 'Request_RandomStudent',
                'Request_CourseRename', 'Request_AddStudents',
                'Request_RetrieveAssistanceRequests', 'Request_TeacherResolveAssistanceRequest',
                'Request_StudentsForClass', 'Request_AdmitStudent',
                'Request_RemoveStudent', 'Request_ChangeStudentPassword',
                'Request_RetrieveCourseKey', 'Request_AssignNewCourseKey',
                'Request_RetrieveHallPassRequests', 'Request_TeacherResolveHallPassRequest',
                'Request_TeacherGrantHallPassRequest', 'Request_TeacherResolveAllAssistanceRequests',
                'Request_TeacherResolveAllHallPassRequests', 'Request_RemoveAllStudents', 'Request_DeleteCourse']}
         ].forEach(testCase => {
            const {role, expected_events} = testCase;
            it(`should only attach relevant io handlers for ${role}s when the user's role is ${role}`, () => {
                    io.__set__('userCount', 0);
                    mock_socket.user_data.role = role;

                    expect(route_connection(mock_socket)).toBeUndefined();

                    const num_handlers_exected = expected_events.length;

                    expect(spy_on.calls.count()).toEqual(num_handlers_exected);
                    // Every attach call to have two parameters: a string and a function
                    for (let i = 0; i < num_handlers_exected; i++) {
                        expect(spy_on.calls.argsFor(i).length).toEqual(2);
                        expect(spy_on.calls.argsFor(i)[0]).toEqual(expected_events[i]);
                        expect(spy_on.calls.argsFor(i)[1]).toBeInstanceOf(Function);
                    }

                    expect(io.__get__('userCount')).toEqual(1);
            });
        });
    });
});