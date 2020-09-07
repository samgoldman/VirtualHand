const rewire = require('rewire')
const io_broadcaster = rewire('../../app/io_broadcaster');

describe('io_broadcaster', () => {
    describe('>init', () => {
        it('should change global_io from null to the provided value', () => {
            expect(io_broadcaster.init).toBeDefined();
            expect(io_broadcaster.__get__('global_io')).toBeNull();
            expect(io_broadcaster.init('test_value')).toBeUndefined();
            expect(io_broadcaster.__get__('global_io')).toEqual('test_value');
        });
    });

    describe('>broadcastGlobally', () => {
        it('should broadcast the given event and data to the entire server', () => {
            expect(io_broadcaster.broadcastGlobally).toBeDefined();

            const mock_io = {
                emit: () => undefined
            };

            io_broadcaster.__set__('global_io', mock_io);

            const spy_emit = spyOn(mock_io, 'emit').and.callThrough();

            expect(io_broadcaster.broadcastGlobally('test_event', {message: 'test_message'})).toBeUndefined();

            expect(spy_emit.calls.count()).toEqual(1);
            expect(spy_emit.calls.argsFor(0).length).toEqual(2);
            expect(spy_emit.calls.argsFor(0)[0]).toEqual('test_event');
            expect(spy_emit.calls.argsFor(0)[1]).toEqual({message: 'test_message'});

            io_broadcaster.__set__('global_io', null);
        });
    });
});