const User = require('../models/user').model;
const Enrollment = require('../models/enrollment').model;
const Promise = require('bluebird');

const addStudent = async (username, password, course_id) => {
	const user = await User.findOrCreate(username, password)
	if (user.role === 'student') {
		await Enrollment.findOrCreate(course_id, user._id, true);
		return `${username} successfully added to the class`;
	} else {
		return `${username} is not a student and was not added to the class`;
	}
};

const addStudents = async (socket, cid, csv, defaultPassword) => {
	const csvSplit = csv.split(',');

	const results = await Promise.map(csvSplit, username => addStudent(username, defaultPassword, cid));
	socket.emit('Response_AddStudents', {
		success: true,
		message: results.join('<br />')
	});
};

// TODO: handle empty enrollments
const getRandomStudent = async (socket, cid) => {
	const enrollments = await Enrollment.find({course: cid, valid: true, admitted: true}).populate('student');
	socket.emit('Response_RandomStudent', {'randomStudentName': enrollments[Math.floor(Math.random() * enrollments.length)].student.username});
};

module.exports = {
    addStudent: addStudent,
	addStudents: addStudents,
	getRandomStudent: getRandomStudent
};