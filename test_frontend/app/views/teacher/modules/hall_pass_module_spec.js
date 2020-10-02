define((require) => {

    describe('hall_pass_module', () => {
        beforeEach(() => {
            require('app/views/teacher/modules/hall_pass_module');
        });

        describe('>countGranted', () => {
            it('should be defined', () => {
                expect(countGranted).toBeDefined();
            });

            [{requests: [], expected: 0},
             {requests: [{granted: false}], expected: 0},
             {requests: [{granted: true}], expected: 1},
             {requests: [{granted: false}, {granted: false}], expected: 0},
             {requests: [{granted: false}, {granted: true}], expected: 1},
             {requests: [{granted: true}, {granted: true}], expected: 2}
            ].forEach(testCase => {
                const {requests, expected} = testCase;
                it(`should return the count of granted requests (Expected: ${expected})`, () => {
                    expect(countGranted(requests)).toEqual(expected);
                });
            })
        });
    });
});