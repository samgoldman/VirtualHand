const AssistanceRequest = require('../../../app/models/assistanceRequest').model;

describe('assistanceRequest', () => {
	describe('>pre validate hook', () => {
		it('should update the timestamp when the assistanceRequest is updated', async () => {
			const request = AssistanceRequest({valid: false});

			expect(request.timestamp).toBeDefined();

			const original_timestamp = request.timestamp;

            while(new Date() <= original_timestamp) {}

			await request.validate();

			expect(request.timestamp).toBeGreaterThan(original_timestamp);
		});
	});
});