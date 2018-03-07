// Load the models
let User = require('./models/user').model;
let Enrollment = require('./models/enrollment').model;
let Course = require('./models/course').model;
let AssistanceRequest = require('./models/assistanceRequest').model;
let nodemailer = require('nodemailer');
let randomstring = require("randomstring");
let Promise = require('bluebird');

// app/routes.js
module.exports = function (io) {
	// Create the object used to send the emails
	let transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: process.env.VH_EMAIL,
			pass: process.env.VH_EMAIL_PASSWORD
		}
	});

	let userCount = 0;

	// Configure what happens when each event is called
	io.on('connection', function (socket) {
		userCount++;
		socket.on('disconnect', function () {
			userCount--;
		});

		socket.on('Request_RecoverPassword', function (data) {
			recoverPassword(socket, data.user_name);
		});

		socket.on('Request_PasswordChange', function (data) {
			changePassword(socket, data.uid, data.oldPassword, data.newPassword);
		});

		socket.on('Request_CourseCreate', function (data) {
			createCourse(socket, data.uid, data.courseName)
		});

		socket.on('Request_RandomStudent', function (data) {
			getRandomStudent(socket, data.cid);
		});

		socket.on('Request_CourseRename', function (data) {
			renameCourse(socket, data.cid, data.newCourseName);
		});

		socket.on('Request_AddStudents', function (data) {
			addStudents(socket, data.cid, data.csv, data.defaultPassword);
		});

		socket.on('Request_AssistanceRequestStatus', function (data) {
			sendAssistanceRequestStatus(socket, data.cid, data.uid);
		});

		socket.on('Request_InitiateAssistanceRequest', function (data) {
			initiateAssistanceRequest(data.cid, data.uid);
		});

		socket.on('Request_ResolveAssistanceRequest', function (data) {
			resolveUserAssistanceRequests(data.cid, data.uid);
		});

		socket.on('Request_RetrieveAssistanceRequests', function (data) {
			retrieveAssistanceRequests(socket, data.cids, data.qty);
		});

		socket.on('Request_TeacherResolveAssistanceRequest', function (data) {
			resolveAssistanceRequests(data.arid);
		});

		socket.on('Request_StudentsForClass', function (data) {
			sendStudentsForClass(socket, data.cid);
		});

		socket.on('Request_AdmitStudent', function (data) {
			admitStudent(socket, data.cid, data.uid);
		});

		socket.on('Request_RemoveStudent', function (data) {
			removeStudent(socket, data.cid, data.uid);
		});

		socket.on('Request_ChangeStudentPassword', function (data) {
			changeStudentPassword(socket, data.tid, data.cid, data.sid, data.password);
		});

		socket.on('Request_RetrieveCourseKey', function (data) {
			retrieveCourseKey(socket, data.cid);
		});

		socket.on('Request_AssignNewCourseKey', function (data) {
			assignNewCourseKey(socket, data.cid);
		});

		socket.on('Request_EnrollStudent', function (data) {
			enrollStudent(socket, data.courseKey, data.sid);
		})
	});

	function recoverPassword(socket, username) {
		User.findOne({'username': username})
			.exec()
			.then(function (user) {
				if (!user || !user.email || user.email === "")
					return "Cannot recover password: either user does not exist or there is no email on record.";

				// TODO: need better password reset method!
				// If all conditions are met, reset the password
				let newPass = randomstring.generate(12);
				user.password = user.generateHash(newPass);
				user.save();
				let email_text = "Virtual Hand has received a request for your account's password to be reset. Your new password is: " + newPass + "\nPlease change it right away.";
				transporter.sendMail({
					to: user.email,
					subject: 'Virtual Hand Password Reset',
					text: email_text
				}, function (error, info) {
					if (error) {
						// TODO log
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				});

				return "Your password has been reset. Please check your email to receive your new password.";
			})
			.then(function (message) {
				socket.emit('Response_RecoverPassword', {
					message: message
				});
			})
			.catch(function (err) {
				console.log(err);
				// TODO Log this error
			});
	}

	function changePassword(socket, userID, oldPassword, newPassword) {
		User.findById(userID)
			.then(function (user) {
				if (user.validPassword(oldPassword)) {
					user.password = user.generateHash(newPassword);
					user.save();
				} else {
					throw new Error('Not authorized to change password');
				}
			})
			.then(function () {
				return 'Your password was changed successfully!';
			})
			.catch(function () {
				return 'Your current password is incorrect!';
			})
			.then(function (message) {
				socket.emit('Response_PasswordChange', {
					message: message
				});
			});
	}

	function createCourse(socket, uid, courseName) {
		User.findById(uid)
			.then(function (user) {
				uid = user._id;
				data = {};
				if (!courseName || courseName === "") {
					data.message = "Class not created: Name must not be blank!";
					data.success = false;
				} else {
					let newCourse = new Course();
					newCourse.courseName = courseName;
					newCourse.teacher = uid;
					newCourse.save();

					data.courseId = newCourse._id;
					data.courseName = courseName;
					data.message = "Class created successfully.";
					data.success = true;
				}
				socket.emit('Response_CourseCreate', data);
			});
	}

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

	function renameCourse(socket, cid, newCourseName) {
		if (!newCourseName || newCourseName === "") {
			socket.emit('Response_RenameCourse', {
				success: false,
				message: 'Class not renamed: Name must not be blank!'
			});
		} else {
			Course.findByIdAndUpdate(cid, {courseName: newCourseName})
				.then(function (course) {
					return Course.findById(course._id);
				})
				.then(function (course) {
					socket.emit('Response_CourseRename', {
						success: true,
						message: 'Class renamed successfully.',
						courseId: course._id,
						courseName: course.courseName
					});
				});
		}
	}

	function addStudent(student) {
		return User.findOrCreate(student.username, student.password)
			.then(function (user) {
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

	function sendAssistanceRequestStatus(socket, cid, uid) {
		AssistanceRequest.count({course: cid, student: uid, resolved: false})
			.then(function (count) {
				socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
			});
	}

	function initiateAssistanceRequest(cid, uid) {
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

	function resolveUserAssistanceRequests(cid, uid) {
		AssistanceRequest.find({student: uid, course: cid, resolved: false}).update({resolved: true})
			.then(function () {
				io.emit('Broadcast_AssistanceRequestModified');
			});
	}

	function retrieveAssistanceRequests(socket, cids, qty) {
		AssistanceRequest.find({
			course: {$in: cids},
			resolved: false
		}).sort('requestTime').limit(qty).populate('student')
			.then(function (requests) {
				socket.emit('Response_RetrieveAssistanceRequests', {requests: requests});
			});
	}

	function resolveAssistanceRequests(arid) {
		AssistanceRequest.findById(arid).update({resolved: true})
			.then(function () {
				io.emit('Broadcast_AssistanceRequestModified');
			});
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
				return Course.findOne({_id: cid, teacher: tid});
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

	function generateCourseKey() {
		return (Math.floor(Math.random() * 1000000000) + parseInt(Date.now() / 1000)).toString(36).toUpperCase().substring(0, 6);
	}

	function retrieveCourseKey(socket, cid) {
		Course.findById(cid)
			.then(function (course) {
				if (!course.courseKey || course.courseKey === "") {
					course.courseKey = generateCourseKey();
					course.save();
				}
				socket.emit('Response_RetrieveCourseKey', {cid: course._id, key: course.courseKey});
			})
			.then(function (newKey) {

			})
	}

	function assignNewCourseKey(socket, cid) {
		Course.findById(cid).update({courseKey: generateCourseKey()})
			.then(function () {
				socket.emit('Response_AssignNewCourseKey', {success: true});
			})
			.catch(function () {
				socket.emit('Response_AssignNewCourseKey', {success: false});
			});
	}

	function enrollStudent(socket, courseKey, sid) {
		Course.findOne({courseKey: courseKey})
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
};