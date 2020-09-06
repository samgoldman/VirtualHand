const Enrollment = require('../../../app/models/enrollment').model;

describe('enrollment', () => {
	describe('>pre validate hook', () => {
		it('should update the timestamp when the enrollment is updated', async () => {
			const enrollment = Enrollment({valid: false});

			expect(enrollment.timestamp).toBeDefined();

			const original_timestamp = enrollment.timestamp;

            while(new Date() <= original_timestamp) {}

			await enrollment.validate();

			expect(enrollment.timestamp).toBeGreaterThan(original_timestamp);
		});
	});
});