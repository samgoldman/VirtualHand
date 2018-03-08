let jwt = require('jsonwebtoken');

function getSocketToken(user) {
	let payload = {};

	if (user) {
		payload.uid = user._id;
		payload.role = user.role;
	} else {
		payload.role = 'guest';
	}

	// Expires in 10 minutes
	return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 60 * 10});
}

function verifyToken(token, callback) {
	jwt.verify(token, process.env.JWT_SECRET, callback);
}

module.exports = {
	getSocketToken: getSocketToken,
	verifyToken: verifyToken
}