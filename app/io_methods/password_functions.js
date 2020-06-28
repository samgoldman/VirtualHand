const randomstring = require("randomstring");
const User = require('../models/user').model;

const recoverPassword = async (username, transporter, done) => {
	const user = await User.findOne({'username': username}).exec();

	if (!user || !user.email || user.email === "")
		done({message: "Cannot recover password: either user does not exist or the user has no email on record."});
	else {
		// If all conditions are met, reset the password
		const newPass = randomstring.generate(12);
		user.password = user.generateHash(newPass);
		await user.save();

		const email_text = `Virtual Hand has received a request for your account's password to be reset. Your new password is: ${newPass} \nPlease change it right away.`;
		transporter.sendMail({
			to: user.email,
			subject: 'Virtual Hand Password Reset',
			text: email_text
		});

		done({message: "Your password has been reset. Please check your email for your new password."});
	}
}

function changePassword(userID, oldPassword, newPassword, done) {
	User.findById(userID)
		.then(function (user) {
			if (user.validPassword(oldPassword)) {
				user.password = user.generateHash(newPassword);
				user.save();
			} else {
				throw new Error('Incorrect old password!');
			}
		})
		.then(function () {
			done({success: true, message: 'Your password was changed successfully!'});
		})
		.catch(function (err) {
			done({success: false, message: err});
		});
}

module.exports = {
	recoverPassword: recoverPassword,
	changePassword: changePassword
}
