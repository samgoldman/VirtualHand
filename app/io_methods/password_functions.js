const randomstring = require("randomstring");
const User = require('../models/user').model;
const Course = require('../models/course').model;
const Enrollment = require('../models/enrollment').model;

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

const changePassword = async (userID, oldPassword, newPassword, done) => {
	const user = await User.findById(userID);

	const result = {success: false, message: 'Undefined error'};

	if (null === user) {
		result.message = 'Error: invalid user id';
	} else if (!user.validPassword(oldPassword)) {
		result.message = 'Error: incorrect old password';
	} else {
		user.password = user.generateHash(newPassword);
		await user.save();
		result.success = true;
		result.message = 'Password changed successfully';
	}

	done(result);
};

const changeStudentPassword = async (socket, teacher_id, course_id, student_id, password) => {
	const teacher = await User.findById(teacher_id);
	const course = await Course.findOne({_id: course_id, teacher: teacher_id, valid: true});
	const enrollment = await Enrollment.find({course: course_id, student: student_id, valid: true, enrolled: true});
	const student = await User.findOne({_id: student_id});

	if (undefined === teacher || undefined === course || undefined === enrollment || undefined === student) {
		socket.emit('Response_ChangeStudentPassword', {
			success: false,
			message: 'Unable to change the students password!'
		});
	} else {
		student.password = student.generateHash(password);
		await student.save();
		socket.emit('Response_ChangeStudentPassword', {
			success: true,
			message: 'Successfully changed the password'
		});
	}
		
}

module.exports = {
	recoverPassword: recoverPassword,
	changePassword: changePassword,
	changeStudentPassword: changeStudentPassword
}
