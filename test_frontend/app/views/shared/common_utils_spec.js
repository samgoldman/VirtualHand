define((require) => {

    describe('common_utils.js', () => {
        beforeEach(() => {
            require('app/views/shared/common_utils');
        });

        describe('>stopwatch_format', () => {
            it('should be defined', () => {
                expect(stopwatch_format).toBeDefined();
            });

            [{now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-01 00:00:00'), expected: '00:00'},
             {now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-01 00:00:10'), expected: '00:10'},
             {now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-01 00:10:00'), expected: '10:00'},
             {now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-01 10:00:00'), expected: '10:00:00'},
             {now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-02 00:00:42'), expected: '1:00:00:42'},
             {now: new Date('2020-01-01 00:00:00'), startTime: new Date('2020-01-03 17:12:09'), expected: '2:17:12:09'}]
             .forEach(testCase => {
                 it(`should return ${testCase.expected} when the start time is ${testCase.startTime} and the current time is ${testCase.now}`, () => {
                     const spy_now = spyOn(Date, 'now').and.returnValue(testCase.now);

                     expect(stopwatch_format(testCase.startTime)).toEqual(testCase.expected);

                     expect(spy_now.calls.count()).toEqual(1);
                     expect(spy_now.calls.argsFor(0)).toEqual([]);
                 });
             });
        });
    });
});