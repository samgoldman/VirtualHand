// Load the models
const MODEL_PATH = './models/';
const User = require(MODEL_PATH + 'user').model;
const Enrollment = require(MODEL_PATH + 'enrollment').model;
const Course = require(MODEL_PATH + 'course').model;
const AssistanceRequest = require(MODEL_PATH + 'assistanceRequest').model;
const HallPassRequest = require(MODEL_PATH + 'hallPassRequest').model;
const nodemailer = require('nodemailer');
const Promise = require('bluebird');
const Token = require('./token_manager');
const {recoverPassword, changePassword} = require("./io_methods/password_functions");
const {createCourse, renameCourse, deleteCourse} = require('./io_methods/course_functions');
const {sendHallPassRequestStatus} = require('./io_methods/hallpass_functions');

// app/routes.js
module.exports = io => {
	// Create the object used to send the emails
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.VH_EMAIL,
			pass: process.env.VH_EMAIL_PASSWORD
		}
	});

	let userCount = 0;

	const authenticateIO = (socket, next) => {
		// Token must be present to authenticate
		if (socket.handshake.query && socket.handshake.query.token) {
			Token.verifyToken(socket.handshake.query.token, (err, decoded) => {
				if (err) return next(new Error('Authentication error'));
				socket.user_data = decoded;
				next();
			});
		}
		next(new Error('Authentication Error'));
	}

	io.use(authenticateIO)
		.on('connection', socket => {
			userCount++;
			socket.on('disconnect', () => userCount--);

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
				socket.on('Request_AssistanceRequestStatus', data => sendAssistanceRequestStatus(socket, socket.user_data.uid, data.cid))
					.on('Request_InitiateAssistanceRequest', data => initiateAssistanceRequest(socket.user_data.uid, data.cid))
					.on('Request_ResolveAssistanceRequest', data => resolveAssistanceRequestByStudentAndClass(socket.user_data.uid, data.cid))
					.on('Request_EnrollStudent', data => enrollStudent(socket, socket.user_data.uid, data.courseKey))
					.on('Request_HallPassRequestStatus', data => sendHallPassRequestStatus(socket, socket.user_data.uid, data.cid))
					.on('Request_InitiateHallPassRequest', data => initiateHallPassRequest(socket.user_data.uid, data.cid))
					.on('Request_StudentResolveHallPassRequest', data => studentResolveHallPassRequest(socket.user_data.uid, data.cid));
			}

			// Teachers only
			if (socket.user_data.role === 'teacher') {
				socket.on('Request_CourseCreate', data => createCourse(socket, socket.user_data.uid, data.courseName))
					.on('Request_RandomStudent', data => getRandomStudent(socket, data.cid))
					.on('Request_CourseRename', data => renameCourse(socket, data.cid, data.newCourseName))
					.on('Request_AddStudents', data => addStudents(socket, data.cid, data.csv, data.defaultPassword))
					.on('Request_RetrieveAssistanceRequests', data => retrieveAssistanceRequests(socket, data.cids, data.qty))
					.on('Request_TeacherResolveAssistanceRequest', data => teacherResolveAssistanceRequest(data.arid))
					.on('Request_StudentsForClass', data => sendStudentsForClass(socket, data.cid))
					.on('Request_AdmitStudent', data => admitStudent(socket, data.cid, data.sid))
					.on('Request_RemoveStudent', data => removeStudent(socket, data.cid, data.sid))
					.on('Request_ChangeStudentPassword', data => changeStudentPassword(socket, socket.user_data.uid, data.cid, data.sid, data.password))
					.on('Request_RetrieveCourseKey', data => retrieveCourseKey(socket, data.cid))
					.on('Request_AssignNewCourseKey', data => assignNewCourseKey(socket, data.cid))
					.on('Request_RetrieveHallPassRequests', data => retrieveHallPassRequests(socket, data.cids))
					.on('Request_TeacherResolveHallPassRequest', data => teacherResolveHallPassRequest(data.hrid))
					.on('Request_TeacherGrantHallPassRequest', data => teacherGrantHallPassRequest(data.hrid))
					.on('Request_TeacherResolveAllAssistanceRequests', data => teacherResolveAllAssistanceRequests(socket.user_data.uid, data.cid))
					.on('Request_TeacherResolveAllHallPassRequests', data => teacherResolveAllHallPassRequests(socket.user_data.uid, data.cid))
					.on('Request_RemoveAllStudents', data => removeAllStudentsFromCourse(socket, socket.user_data.uid, data.cid))
					.on('Request_DeleteCourse', data => deleteCourse(socket, socket.user_data.uid, data.cid));
			}
		});

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

	function addStudent(student) {
		return User.findOrCreate(student.username, student.password)
			.then(function (user) {
				user.role = 'student';
				user.save();
				return Enrollment.findOrCreate(student.cid, user._id, true);
			})
			.then(function () {
				return User.find({username: student.username});
			});
	}

	function addStudents(socket, cid, csv, defaultPassword) {
		let csvSplit = csv.split(',');
		let newStudents = [];
		csvSplit.map((username) => {
			newStudents.push({username: username, cid: cid, password: defaultPassword})
		});

		Promise.map(newStudents, addStudent)
			.then(function () {
				socket.emit('Response_AddStudents', {
					success: true,
					message: 'Students successfully added to the class.'
				});
			});
	}

	function sendAssistanceRequestStatus(socket, uid, cid) {
		AssistanceRequest.count({course: cid, student: uid, resolved: false})
			.then(function (count) {
				socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
			});
	}

	function initiateAssistanceRequest(uid, cid) {
		AssistanceRequest.findOne({student: uid, course: cid, resolved: false})
			.then(function (ar) {
				if (ar)
					throw 'Request for this student in this class already exists';
				else
					return AssistanceRequest.create({student: uid, course: cid, resolved: false});
			})
			.then(function () {
				io.emit('Broadcast_AssistanceRequestModified');
			})
			.catch(function () {
			});
	}

	function resolveAssistanceRequestByStudentAndClass(uid, cid) {
		AssistanceRequest.find({student: uid, course: cid, resolved: false})
			.update({resolved: true, resolved_type: 'student', resolvedTime: Date.now()})
			.then(function () {
				io.emit('Broadcast_AssistanceRequestModified');
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

	function teacherResolveAssistanceRequest(arid) {
		AssistanceRequest.findById(arid)
			.update({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()})
			.then(function () {
				io.emit('Broadcast_AssistanceRequestModified');
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

	function changeStudentPassword(socket, tid, cid, sid, password) {
		User.findById(tid)
			.then(function (teacher) {
				if (!teacher) throw "Teacher doesn't exist";
				return Course.findOne({_id: cid, teacher: tid, valid: true});
			})
			.then(function (course) {
				if (!course) throw "Teacher doesn't teacher that course";
				return Enrollment.find({course: cid, student: sid, valid: true, enrolled: true});
			})
			.then(function (enrollment) {
				if (!enrollment) throw "Student isn't in that class";
				return User.findOne({_id: sid});
			})
			.then(function (user) {
				user.password = user.generateHash(password);
				user.save();
			})
			.then(function () {
				socket.emit('Response_ChangeStudentPassword', {
					success: true,
					message: 'Successfully changed the password'
				});
			})
			.catch(function (err) {
				socket.emit('Response_ChangeStudentPassword', {success: false, message: err});
			});
	}

	function retrieveCourseKey(socket, cid) {
		Course.findById(cid)
			.then(function (course) {
				if (!course.courseKey || course.courseKey === "") {
					course.courseKey = Course.generateCourseKey();
					course.save();
				}
				socket.emit('Response_RetrieveCourseKey', {cid: course._id, key: course.courseKey});
			})
			.then(function (newKey) {

			})
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

	function initiateHallPassRequest(sid, cid) {
		Enrollment.confirmStudentInClass(sid, cid)
			.then(HallPassRequest.findOne({student: sid, course: cid, resolved: false}))
			.then(function (hpr) {
				if (hpr)
					throw 'Request for this student in this class already exists';
				else
					return HallPassRequest.create({student: sid, course: cid, resolved: false, granted: false});
			})
			.then(function () {
				io.emit('Broadcast_HallPassRequestModified');
			})
			.catch(function (err) {
				console.log(err);
			});
	}

	function studentResolveHallPassRequest(sid, cid) {
		HallPassRequest.find({student: sid, course: cid, resolved: false})
			.update({resolved: true, resolved_type: 'student', resolvedTime: Date.now()})
			.then(function(){
				io.emit('Broadcast_HallPassRequestModified');
			})
			.catch((err) => {
				console.log(err);
			});
	}

	function teacherResolveHallPassRequest(hrid) {
		HallPassRequest.findById(hrid)
			.update({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()})
			.then(function(){
				io.emit('Broadcast_HallPassRequestModified');
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
				io.emit('Broadcast_HallPassRequestModified');
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
};
