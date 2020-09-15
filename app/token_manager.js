const jwt = require('jsonwebtoken');

const getSocketToken = user => {
	const payload = {};

	if (user) {
		payload.uid = user._id;
		payload.role = user.role;
	} else {
		payload.role = 'guest';
	}

	// Expires in 100 minutes
	// TODO: shorten and implement refresh process
	return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: 60 * 100});
}

const verifyToken = (token, callback) => {
	jwt.verify(token, process.env.JWT_SECRET, callback);
}

module.exports = {
	getSocketToken: getSocketToken,
	verifyToken: verifyToken
}
