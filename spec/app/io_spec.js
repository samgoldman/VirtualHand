const rewire = require('rewire');
const nodemailer = require('nodemailer');

const io = rewire('../../app/io');

describe('io', () => {
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

            expect(io.__get__('global_io')).toBeNull();
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

            expect(io.__get__('global_io')).toEqual(mock_io);
            expect(io.__get__('transporter')).toEqual('nodemailer_transport');

            process.env.VH_EMAIL = original_email;
            process.env.VH_EMAIL_PASSWORD = original_email_pwd;
        });
    });
});