const User = require('../models/user').model;
const Enrollment = require('../models/enrollment').model;
const Course = require('../models/course').model;
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

const sendStudentsForClass = async (socket, cid) => {
	const enrollments = await Enrollment.find({course: cid, valid: true})
		.populate('student').sort('student.username');
	socket.emit('Response_StudentsForClass', {enrollments: enrollments});
};

const admitStudent = async (socket, cid, uid) => {
	await Enrollment.find({course: cid, student: uid, valid: true}).updateOne({admitted: true});
	socket.emit('Response_AdmitStudent', {cid: cid, student: uid});
};

const removeStudent = async (socket, cid, uid) => {
	await Enrollment.find({course: cid, student: uid, valid: true}).updateOne({valid: false});
	socket.emit('Response_RemoveStudent', {cid: cid, student: uid});
}

const enrollStudent = async (socket, sid, courseKey) => {
	const course = await Course.findOne({courseKey: courseKey, valid: true});
	if (course) {
		await Enrollment.findOrCreate(course._id, sid, false);
		socket.emit('Response_EnrollStudent', {
			success: true,
			message: 'Enrolled successfully: your teacher must now admit you into the class.'
		});
	} else {
		socket.emit('Response_EnrollStudent', {success: false, message: 'Course key is invalid'});
	}
};

const removeAllStudentsFromCourse = async (socket, uid, cid) => {
	try {
		await Course.verifyCourseTaughtBy(cid, uid);
		await Enrollment.find({course: cid, valid: true}).updateMany({valid: false});
		socket.emit('Response_RemoveAllStudents', {success: true, message: 'Successfully removed all students'});
	} catch (err) {
		socket.emit('Request_RemoveAllStudents', {success: false, message: err.message});
	}
};

module.exports = {
    addStudent: addStudent,
	addStudents: addStudents,
	getRandomStudent: getRandomStudent,
	sendStudentsForClass: sendStudentsForClass,
	admitStudent: admitStudent,
	removeStudent: removeStudent,
	enrollStudent: enrollStudent,
	removeAllStudentsFromCourse: removeAllStudentsFromCourse
};