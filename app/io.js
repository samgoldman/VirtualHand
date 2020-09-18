// Load the models
const nodemailer = require('nodemailer');
const Token = require('./token_manager');
const {recoverPassword, changePassword, changeStudentPassword} = require("./io_methods/password_functions");
const {createCourse, renameCourse, deleteCourse, retrieveCourseKey, assignNewCourseKey} = require('./io_methods/course_functions');
const {sendHallPassRequestStatus, studentResolveHallPassRequest, initiateHallPassRequest, teacherResolveHallPassRequest, teacherGrantHallPassRequest, retrieveHallPassRequests, teacherResolveAllHallPassRequests} = require('./io_methods/hallpass_functions');
const {sendAssistanceRequestStatus, teacherResolveAssistanceRequest, initiateAssistanceRequest, resolveAssistanceRequestByStudentAndClass, retrieveAssistanceRequests, teacherResolveAllAssistanceRequests} = require('./io_methods/assistance_functions');
const {addStudent, addStudents, getRandomStudent, sendStudentsForClass, admitStudent, removeStudent, enrollStudent, removeAllStudentsFromCourse} = require('./io_methods/student_functions');

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

module.exports = io => {
	// Create the object used to send the emails
	transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.VH_EMAIL,
			pass: process.env.VH_EMAIL_PASSWORD
		}
	});

	io.use(authenticateIO)
		.on('connection', route_connection);
};
