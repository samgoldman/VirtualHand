const rewire = require('rewire')
const io_broadcaster = rewire('../../app/io_broadcaster');

describe('io_broadcaster', () => {
    describe('>init', () => {
        it('should change global_io from null to the provided value', () => {
            expect(io_broadcaster.__get__('global_io')).toBeNull();

            expect(io_broadcaster.init('test_value')).toBeUndefined();

            expect(io_broadcaster.__get__('global_io')).toEqual('test_value');
        });
    });
});