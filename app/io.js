// Load the models
const MODEL_PATH = './models/';
const Enrollment = require(MODEL_PATH + 'enrollment').model;
const Course = require(MODEL_PATH + 'course').model;
const AssistanceRequest = require(MODEL_PATH + 'assistanceRequest').model;
const HallPassRequest = require(MODEL_PATH + 'hallPassRequest').model;
const nodemailer = require('nodemailer');
const Token = require('./token_manager');
const {recoverPassword, changePassword, changeStudentPassword} = require("./io_methods/password_functions");
const {createCourse, renameCourse, deleteCourse, retrieveCourseKey} = require('./io_methods/course_functions');
const {sendHallPassRequestStatus, studentResolveHallPassRequest, initiateHallPassRequest} = require('./io_methods/hallpass_functions');
const {sendAssistanceRequestStatus, teacherResolveAssistanceRequest, initiateAssistanceRequest} = require('./io_methods/assistance_functions');
const {addStudent, addStudents} = require('./io_methods/student_functions');

let global_io = null;
let userCount = 0;
let transporter = null;

const authenticateIO = (socket, next) => {
	// Token must be present to authenticate
	if (socket.handshake.query && socket.handshake.query.token) {
		Token.verifyToken(socket.handshake.query.token, (err, decoded) => {
			if (err) return next(new Error('Authentication Error'));
			socket.user_data = decoded;
			next();
		});
	} else {
		next(new Error('Authentication Error'));
	}
}

const handle_disconnect = () => userCount--;

const route_connection = socket => {
	userCount++;
	socket.on('disconnect', handle_disconnect);

	// ALL - public included
	if (socket.user_data.role === 'guest' || socket.user_data.role === 'student' || socket.user_data.role === 'teacher' || socket.user_data.role === 'admin') {
		socket.on('Request_RecoverPassword', (data, callback) => recoverPassword(data.user_name, transporter, callback));
	}

	// Logged in users
	if (socket.user_data.role === 'student' || socket.user_data.role === 'teacher' || socket.user_data.role === 'admin') {
		socket.on('Request_PasswordChange', (data, callback) => changePassword(socket.user_data.uid, data.oldPassword, data.newPassword, callback));
	}

	// Students only
	if (socket.user_data.role === 'student') {
		socket.on('Request_AssistanceRequestStatus', data => sendAssistanceRequestStatus(socket, socket.user_data.uid, data.cid));
		socket.on('Request_InitiateAssistanceRequest', data => initiateAssistanceRequest(socket.user_data.uid, data.cid));
		socket.on('Request_ResolveAssistanceRequest', data => resolveAssistanceRequestByStudentAndClass(socket.user_data.uid, data.cid));
		socket.on('Request_EnrollStudent', data => enrollStudent(socket, socket.user_data.uid, data.courseKey));
		socket.on('Request_HallPassRequestStatus', data => sendHallPassRequestStatus(socket, socket.user_data.uid, data.cid));
		socket.on('Request_InitiateHallPassRequest', data => initiateHallPassRequest(socket.user_data.uid, data.cid));
		socket.on('Request_StudentResolveHallPassRequest', data => studentResolveHallPassRequest(socket.user_data.uid, data.cid));
	}

	// Teachers only
	if (socket.user_data.role === 'teacher') {
		socket.on('Request_CourseCreate', data => createCourse(socket, socket.user_data.uid, data.courseName));
		socket.on('Request_RandomStudent', data => getRandomStudent(socket, data.cid));
		socket.on('Request_CourseRename', data => renameCourse(socket, data.cid, data.newCourseName));
		socket.on('Request_AddStudents', data => addStudents(socket, data.cid, data.csv, data.defaultPassword));
		socket.on('Request_RetrieveAssistanceRequests', data => retrieveAssistanceRequests(socket, data.cids, data.qty));
		socket.on('Request_TeacherResolveAssistanceRequest', data => teacherResolveAssistanceRequest(data.arid));
		socket.on('Request_StudentsForClass', data => sendStudentsForClass(socket, data.cid));
		socket.on('Request_AdmitStudent', data => admitStudent(socket, data.cid, data.sid));
		socket.on('Request_RemoveStudent', data => removeStudent(socket, data.cid, data.sid));
		socket.on('Request_ChangeStudentPassword', data => changeStudentPassword(socket, socket.user_data.uid, data.cid, data.sid, data.password));
		socket.on('Request_RetrieveCourseKey', data => retrieveCourseKey(socket, data.cid));
		socket.on('Request_AssignNewCourseKey', data => assignNewCourseKey(socket, data.cid));
		socket.on('Request_RetrieveHallPassRequests', data => retrieveHallPassRequests(socket, data.cids));
		socket.on('Request_TeacherResolveHallPassRequest', data => teacherResolveHallPassRequest(data.hrid));
		socket.on('Request_TeacherGrantHallPassRequest', data => teacherGrantHallPassRequest(data.hrid));
		socket.on('Request_TeacherResolveAllAssistanceRequests', data => teacherResolveAllAssistanceRequests(socket.user_data.uid, data.cid));
		socket.on('Request_TeacherResolveAllHallPassRequests', data => teacherResolveAllHallPassRequests(socket.user_data.uid, data.cid));
		socket.on('Request_RemoveAllStudents', data => removeAllStudentsFromCourse(socket, socket.user_data.uid, data.cid));
		socket.on('Request_DeleteCourse', data => deleteCourse(socket, socket.user_data.uid, data.cid));
	}
};

function getRandomStudent(socket, cid) {
	Enrollment.count({course: cid, valid: true, admitted: true})
		.then(function (count) {
			return Enrollment.findOne({
				course: cid,
				valid: true,
				admitted: true
			}).skip(Math.floor(Math.random() * count)).populate('student');
		})
		.then(function (enrollment) {
			if (enrollment)
				socket.emit('Response_RandomStudent', {'randomStudentName': enrollment.student.username});
		});
}

function resolveAssistanceRequestByStudentAndClass(uid, cid) {
	AssistanceRequest.find({student: uid, course: cid, resolved: false})
		.update({resolved: true, resolved_type: 'student', resolvedTime: Date.now()})
		.then(function () {
			global_io.emit('Broadcast_AssistanceRequestModified');
		});
}

function retrieveAssistanceRequests(socket, cids) {
	AssistanceRequest.find({course: {$in: cids}, resolved: false})
		.sort('requestTime')
		.populate('student')
		.then(function (requests) {
			socket.emit('Response_RetrieveAssistanceRequests', {requests: requests});
		});
}

function teacherResolveAllAssistanceRequests(uid, cid) {
	Course.verifyCourseTaughtBy(cid, uid)
		.then(() => {return AssistanceRequest.find({course: cid, resolved: false});})
		.then(function(requests) {
			requests.forEach((request) => teacherResolveAssistanceRequest(request._id));
		})
		.catch((err) => {console.log(`Err: ${err}`)});
}

function sendStudentsForClass(socket, cid) {
	Enrollment.find({course: cid, valid: true}).populate('student').sort('student.username')
		.then(function (enrollments) {
			socket.emit('Response_StudentsForClass', {enrollments: enrollments});
		});
}

function admitStudent(socket, cid, uid) {
	Enrollment.find({course: cid, student: uid, valid: true}).update({admitted: true})
		.then(function () {
			socket.emit('Response_AdmitStudent', {cid: cid, student: uid});
		});
}

function removeStudent(socket, cid, uid) {
	Enrollment.find({course: cid, student: uid, valid: true}).update({valid: false})
		.then(function () {
			socket.emit('Response_RemoveStudent', {cid: cid, student: uid});
		});
}

function assignNewCourseKey(socket, cid) {
	Course.findById(cid)
		.update({courseKey: Course.generateCourseKey()})
		.then(function () {
			socket.emit('Response_AssignNewCourseKey', {success: true});
		})
		.catch(function () {
			socket.emit('Response_AssignNewCourseKey', {success: false});
		});
}

function enrollStudent(socket, sid, courseKey) {
	Course.findOne({courseKey: courseKey, valid: true})
		.then(function (course) {
			if (!course) {
				throw "Course Key is invalid";
			}
			return Enrollment.findOrCreate(course._id, sid, false);
		})
		.then(function () {
			socket.emit('Response_EnrollStudent', {
				success: true,
				message: 'Enrolled sucessfully: your teacher must now admit you into the class.'
			});
		})
		.catch(function (err) {
			socket.emit('Response_EnrollStudent', {success: false, message: err});
		})
}

function retrieveHallPassRequests(socket, cids) {
	HallPassRequest.find({course: {$in: cids}, resolved: false})
		.sort('requestTime')
		.populate('student')
		.then(function (requests) {
			socket.emit('Response_RetrieveHallPassRequests', {requests: requests});
		});
}

function teacherResolveHallPassRequest(hrid) {
	HallPassRequest.findById(hrid)
		.update({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()})
		.then(function(){
			global_io.emit('Broadcast_HallPassRequestModified');
		});
}

function teacherResolveAllHallPassRequests(uid, cid) {
	Course.verifyCourseTaughtBy(cid, uid)
		.then(() => {return HallPassRequest.find({course: cid, resolved: false});})
		.then(function(requests) {
			requests.forEach((request) => teacherResolveHallPassRequest(request._id));
		})
		.catch((err) => {console.log(`Err: ${err}`)});
}

function teacherGrantHallPassRequest(hrid) {
	HallPassRequest.findById(hrid)
		.update({granted: true, grantedTime: Date.now()})
		.then(function(){
			global_io.emit('Broadcast_HallPassRequestModified');
		});
}

function removeAllStudentsFromCourse(socket, uid, cid) {
	Course.verifyCourseTaughtBy(cid, uid)
		.then(() => {return Enrollment.find({course: cid, valid: true}).update({valid: false})})
		.then(function() {
			socket.emit('Response_RemoveAllStudents', {success: true, message: 'Successfully removed all students'});
		})
		.catch(err => socket.emit('Request_RemoveAllStudents', {success: false, message: err}));
}

module.exports = io => {
	// Create the object used to send the emails
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.VH_EMAIL,
			pass: process.env.VH_EMAIL_PASSWORD
		}
	});

	global_io = io;

	io.use(authenticateIO)
		.on('connection', route_connection);
};
