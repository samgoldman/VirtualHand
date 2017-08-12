// Load the models
var Action_Log = require('./models/action_log');
var User = require('./models/user');
var Hand_State = require('./models/hand_state');
var Class = require('./models/class');

// For dealing with actions
var Handler = require('./action_log_handler');

// Send emails
var nodemailer = require('nodemailer');

// For password resets
var randomstring = require("randomstring");

// Reading from files
var fs = require('fs');
var path = require('path');

// app/routes.js
module.exports = function(io) {

	// Create the object used to send the emails
	var transporter = nodemailer.createTransport({
		// Send from my personal account, but is later configured to be from an
		// @stlclassrooms.com email
		service : 'gmail',
		auth : {
			user : process.env.VH_EMAIL,
			pass : process.env.VH_EMAIL_PASSWORD
		}
	});

	var userCount = 0;

	// Configure what happens when each event is called
	io.on('connection', function(socket) {

		userCount++;

		socket.on('disconnect', function() {
			userCount--;
		});

		socket.on('GetLoggedInCount', function(data) {
			socket.emit('LoggedInCount', {
				count : userCount
			});
		});

		socket.on('CreateClass', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:CreateClass', JSON.stringify(data));
			createClass(socket, data.user_id, data.classname);
		});

		/**
		 * @IO_Request ContactUs - A method from the front page for users or
		 *             potential users to contact site admin
		 * @IO_Param name - provided by the user attempting to contact the admin
		 * @IO_Param email - the email provided by the user attempting ot
		 *           contact the admin
		 * @IO_Param message - the message for the admin
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ContactUs', function(data) {
			// Use action_log_handler to email admin w/ name, email and message
			Handler.send_contact_us_message(data.name, data.email, data.message);
		});

		/**
		 * @IO_Request GetLogFileNames - a method for the admin to get the names
		 *             of log files for the purpose of viewing them
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetLogFileNames', function(data) {
			// Send log file names w/ socket information
			sendLogFileNames(socket);
		});

		/**
		 * @IO_Request GetClassKey -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetClassKey', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:GetClassKey', JSON.stringify(data));
			getClassKey(socket, data.class_id);
		});

		/**
		 * @IO_Request ChangeClassKey -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ChangeClassKey', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:ChangeClassKey', JSON.stringify(data));
			changeClassKey(socket, data.class_id, data.newkey);
		});

		/**
		 * @IO_Request RecoverPassword -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('RecoverPassword', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:RecoverPassword', JSON.stringify(data));
			recoverPassword(socket, data.user_name);
		});

		/**
		 * @IO_Request ChangeStudentPassword -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ChangeStudentPassword', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:4571453212145306', "Data ommitted for privacy of users");
			changeStudentPassword(socket, data.user_id, data.student_id, data.new_password);
		});

		/**
		 * @IO_Request FeedBackForm -
		 * @IO_Param user_id - the id of the user
		 * @IO_Param title - the title of the feedback
		 * @IO_Param message - the feedback message
		 * @IO_Param type - the type of feedback (comment, question, bug report)
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('FeedBackForm', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:8563242957585306', JSON.stringify(data));
			handleFeedback(socket, data.user_id, data.title, data.message, data.type);
		});

		/**
		 * @IO_Request ChangePassword - For users to change their password
		 * @IO_Param user_id - the id of the user attempting to change their
		 *           password
		 * @IO_Param oldPass - the current password of the user attempting to
		 *           change their password (authenticates user again prior to
		 *           change)
		 * @IO_Param newPass - the password that the user wishes to change to
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ChangePassword', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:143692947595306', 'user_id: ' + data.user_id);
			changePassword(socket, data.user_id, data.oldPass, data.newPass);
		});

		/**
		 * @IO_Request GetTeachersInSchool - Gets all teachers registered for a
		 *             given school
		 * @IO_Param school - the school that teachers a being requested for
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetTeachersInSchool', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:406507361149123', JSON.stringify(data));
			sendTeachers(socket, data.school);
		});

		/**
		 * @IO_Request GetAllStudentsBySchool - Gets all students registered for
		 *             a given school, and who are not enrolled in the given
		 *             school
		 * @IO_Param school - the school that students are being requested for
		 * @IO_Param class_id - the id of the class used to filter out students
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetAllStudentsBySchool', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:309202479729287', JSON.stringify(data));
			sendStudents(socket, data.school, data.class_id);
		});

		/**
		 * @IO_Request GetSchools - Gets all schools registered in the system
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetSchools', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:05305168039050', JSON.stringify(data));
			sendSchools(socket);
		});

		/**
		 * @IO_Request GetClassesByTeacher - Get all classes for a given teacher
		 *             that a student is not enrolled in
		 * @IO_Param teacher - the id of the teacher classes are requested for
		 * @IO_Param user_id - the id of the user that is not enrolled in
		 *           classes that are returned
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetClassesByTeacher', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:100864841759076', JSON.stringify(data));
			sendClasses(socket, data.teacher, data.user_id);
		});

		/**
		 * @IO_Request ChangeClassName - For teacher to change the name of one
		 *             of their classes
		 * @IO_Param class_id - the id of the class which is being renamed
		 * @IO_Param new_classname - the requested new name for the class
		 * @IO_Param id - the session id of the origin of the request
		 * @IO_Param user_id - the id of the teacher, used to ensure the class
		 *           name requested is unique
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ChangeClassName', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:710481430717410', JSON.stringify(data));
			changeClassName(socket, data.class_id, data.new_classname, data.id, data.user_id);
		});

		/**
		 * @IO_Request GetHandsForClasses - Request students hands for a given
		 *             array of classes
		 * @IO_Param classes - array of class ids hands are requested for
		 * @IO_Param user_id - the id of the user requesting the hands
		 * @IO_Param id - the session id of the origin of the request
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetHandsForClasses', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:901325241048647', JSON.stringify(data));
			sendHands(socket, data.classes, data.user_id, data.id);
		});

		/**
		 * @IO_Request Enroll - Request by a student to enroll in a class
		 * @IO_Param teacher_id - id of the teacher whose class the student is
		 *           enrolling in
		 * @IO_Param class_id - the id of the class the student is trying to
		 *           enroll in
		 * @IO_Param user_id - the id of the student enrolling
		 * @IO_Param id - the session id of the origin of the request
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('Enroll', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:887872002544764', JSON.stringify(data));
			// enroll(socket, data.teacher_id, data.class_id, data.user_id,
			// data.id);
			enroll2(socket, data.id, data.class_key, data.user_id);
		});

		/**
		 * @IO_Request GetInitialHand - A request from a student to get their
		 *             current hand state in a given class
		 * @IO_Param id - the session id of the origin of the request
		 * @IO_Param handstate_id - the id of the handstate getting status for
		 *           (represents a hand in a class)
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetInitialHand', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:342346326975193', JSON.stringify(data));
			sendInitialHand(socket, data.id, data.handstate_id);
		});

		/**
		 * @IO_Request ChangeHand - Request by a student to change a hand state
		 *             status
		 * @IO_Param handstate_id - the id of the hand state to change status of
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('ChangeHand', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:443579319884763', JSON.stringify(data));
			changeHand(socket, data.handstate_id);
		});

		/**
		 * @IO_Request AdmitToClass - A request by a teacher to admit a student
		 *             requesting enrollment into a class
		 * @IO_Param hand_state_id - the id of the hand state to admit to the
		 *           class
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('AdmitToClass', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:825121332093822', JSON.stringify(data));
			admit(socket, data.hand_state_id);
		});

		/**
		 * @IO_Request GetAllHandsForClasses - A request to get all hands for
		 *             classes, split up by admitted and waiting hands Note - in
		 *             practice, classes is an array of size one, although it
		 *             supports multiple classes
		 * @IO_Param classes - an array of class ids for classes for which hands
		 *           are being requested
		 * @IO_Param user_id - the user id of the requester
		 * @IO_Param id - the session id of the origin of the request
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetAllHandsForClasses', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:848394201626071', JSON.stringify(data));
			sendAllHands(socket, data.classes, data.user_id, data.id);
		});

		/**
		 * @IO_Request RemoveStudent - Request to remove a student from a class
		 * @IO_Param hand_state_id - the id of the hand state to remove from its
		 *           class
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('RemoveStudent', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:097560302911021', JSON.stringify(data));
			removeStudent(socket, data.hand_state_id);
		});

		/**
		 * @IO_Request AddClassKey - An by a teacher to add a class key to an
		 *             account
		 * @IO_Param id - the session id of the origin of the request
		 * @IO_Param user_id - the id of the teacher requesting the addition of
		 *           a class key to an account
		 * @IO_Param class_key - the text of the class key being added
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('AddClassKey', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:440085896207995', JSON.stringify(data));
			addClassKey(socket, data.id, data.user_id, data.class_key);
		});

		/**
		 * @IO_Request CreateClassKey - An administrative only request to create
		 *             a class key
		 * @IO_Param user_id - the id of the admin requesting the key creation
		 * @IO_Param code - the text code of the key
		 * @IO_Param classes - the number of classes this key is worth
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('CreateClassKey', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:891950868135987', JSON.stringify(data));
			createKey(data.user_id, data.code, data.classes);
		});

		/**
		 * @IO_Request TeacherCreateStudent - A request by a teacher to create a
		 *             student and enroll them in their class
		 * @IO_Param student_name - the username of the new student
		 * @IO_Param password - the password of the new student
		 * @IO_Param class_id - the class id of the class the new student will
		 *           be enrolled in
		 * @IO_Param school - the school the new student will be registered
		 *           under
		 * @IO_Param user_id - the user id of the teacher making the creation
		 *           request
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('TeacherCreateStudent', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:072396400722902', JSON.stringify(data));
			createStudent(socket, data.student_name, data.password, data.class_id, data.school, data.user_id);
		});

		/**
		 * @IO_Request TeacherEnrollStudent - A request by a teacher to enroll a
		 *             pre-existing student in one of their classes
		 * @IO_Param student_id - the user id of the student the teacher is
		 *           attempting to enroll
		 * @IO_Param class_id - the class id of the class the teacher is
		 *           enrolling the student in
		 * @IO_Param user_id - the user id of the teacher making the request
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('TeacherEnrollStudent', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:237839000447546', JSON.stringify(data));
			enrollStudent(socket, data.student_id, data.class_id, data.user_id);
		});
		
		/**
		 * @IO_Request CreateMessage -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('CreateMessage', function(data) {
			Handler.create_action_log_and_handle('Action', 0, 'io.js:CreateMessage', JSON.stringify(data));
			createMessage(socket, data.name, data.message);
		});
		
		/**
		 * @IO_Request CreateMessage -
		 * @IO_Param
		 * @param data -
		 *            collection of IO_Params provided by socket.io
		 */
		socket.on('GetRandomStudent', function(data){
			sendRandomStudent(socket, data.classes)
		});
	});

	function createClass(socket, user_id, classname) {
		User.findById(user_id).deepPopulate("teacher_classes teacher_classes.id teacher_classes.classname").exec(function(err, user) {
			var msg = "";

			var contains_name = false;
			var name = classname;

			for (var i = 0; i < user.teacher_classes.length; i++) {
				if (user.teacher_classes[i].classname == name) {
					contains_name = true;
					break;
				}
			}

			if (contains_name) {
				msg = "Class not created: you already have a class of this name!";
			} else {
				var newClass = new Class();
				newClass.classname = name;
				newClass.hands = new Array();
				newClass.school = user.school;

				newClass.save(function(err, msg) {

					if (err) {

						var log = new Action_Log();
						log.title = "Database Error";
						log.message = "Error: " + err;
						log.author = "routes.js:POST:/createClass:newClass.save";
						log.alert_level = 1;
						Handler.handle_log(log);
						log.save();
					}

					user.teacher_classes.push(newClass.id);
					user.save();
				});
				msg = "Class created successfully!";
			}

			socket.emit('CreateClassResponse', {
				message : msg
			});
		});
	}

	function createMessage(socket, n, m) {
		var data = {
			name : n,
			message : m,
			sent : false
		};
		User.find({
			isTeacher : true
		}).exec(function(err, users) {
			for (var i = 0; i < users.length; i++) {
				users[i].metaData.push(data);
				users[i].save();
			}
		});
	}

	function sendLogFileNames(socket) {
		fs.readdir('./', function(err, files) {
			socket.emit('SendLogFileNames', {
				list : files
			});
		});
	}

	function getClassKey(socket, class_id) {
		Class.findById(class_id).exec(function(err, cls) {
			if (err) { // Handle any error that occurs
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:getClassKey()', JSON.stringify(err));
			} else {
				if (!cls.classKey) {
					createNewKey(function(newkey) {
						cls.classKey = newkey;
						cls.save();
						getClassKey(socket, class_id);
					});
				} else {
					socket.emit('SendClassKey', {
						key : cls.classKey
					});
				}
			}
		});
	}

	function createNewKey(callback) {
		var newkey = randomstring.generate(4);
		Class.findOne({
			'classKey' : newkey
		}).exec(function(err, cls) {
			if (!cls) {
				callback(newkey);
			} else {
				createNewKey(callback);
			}
		});
	}

	function verifyNewKey(newkey, callback) {
		Class.findOne({
			'classKey' : newkey
		}).exec(function(err, cls) {
			callback(!cls);
		});
	}

	function changeClassKey(socket, class_id, newkey) {
		verifyNewKey(newkey, function(valid) {
			if (valid) {
				Class.findById(class_id).exec(function(err, cls) {
					if (err) { // Handle any error that occurs
						Handler.create_action_log_and_handle('Database Error', 1, 'io.js:changeClassKey()', JSON.stringify(err));
					} else {
						cls.classKey = newkey;
						cls.save();
						getClassKey(socket, class_id);
					}
				});
			}
			socket.emit('ChangeClassKeyResponse', {
				success : valid
			});
		});
	}

	function recoverPassword(socket, user_name) {
		User
				.findOne({
					'username' : user_name
				})
				.exec(
						function(err, user) {
							if (err) { // Handle any error that occurs
								Handler.create_action_log_and_handle('Database Error', 1, 'io.js:4516154646546', err);
							}
							if (!user) {
								socket.emit('RecoverPasswordResponse', {
									message : "There is no record of a user with that username."
								});
							} else {
								if (user.is_student) {
									socket.emit('RecoverPasswordResponse', {
										message : "The system cannot reset passwords for students. Please contact your teacher, who can reset your password."
									});
								} else {
									if (user.email != "") {
										var newPass = randomstring.generate(12);
										user.password = user.generateHash(newPass);
										user.save();
										msg = "Virtual Hand has received a request for your account's password to be reset. Your new password is: " + newPass + "\nPlease change it right away.";

										transporter.sendMail({
											to : user.email,
											subject : 'Virtual Hand Password Reset',
											text : msg
										}, function(error, info) {
											if (error) {
												console.log(error);
											} else {
												console.log('Message sent: ' + info.response);
											}
										});

										socket.emit('RecoverPasswordResponse', {
											message : "Your password has been reset. Please check your email (" + user.email + ") to receive your new password."
										});
									} else {
										socket
												.emit(
														'RecoverPasswordResponse',
														{
															message : "The system does not have an email for your account, which means you are not a paid subscriber. Please contact Virtual Hand support at sgoldman216@gmail.com with your username to have your account recovered."
														});
									}
								}
							}
						});
	}

	/**
	 * A request by a teacher to enroll a pre-existing student in one of their
	 * classes
	 * 
	 * @param socket -
	 *            the socket.io socket to send responses to
	 * @param sid -
	 *            the user id of the student the teacher is attempting to enroll
	 * @param cid -
	 *            the class id of the class the teacher is enrolling the student
	 *            in
	 * @param uid -
	 *            the user id of the teacher making the request
	 */
	function enrollStudent(socket, sid, cid, uid) {
		// Get the user making the request, populate the user's teacher classes
		User.findById(uid).populate('teacher_classes').exec(function(err, teacher) {
			if (err) { // Handle any error that occurs
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:861514332885587', err);
			}
			if (teacher !== null) { // If the teacher exists
				var clss = null;

				// Search in the teacher's classes for the class_id requested,
				// save it to clss and break if found
				for (var i = 0; i < teacher.teacher_classes.length; i++) {
					if (teacher.teacher_classes[i].id == cid) {
						clss = teacher.teacher_classes[i];
						break;
					}
				}

				// If the class was found, proceed by finding the student and
				// populating their classes
				if (clss !== null) {
					User.findById(sid).populate("student_classes").exec(function(err, student) {
						if (err) {
							// Handle error
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:270617650787035', err);
						}

						Hand_State.findOne({
							user : sid,
							class_id : cid
						}).exec(function(err, hs) {
							if (hs) {
								socket.emit('TeacherEnrollStudentResponse', {
									message : '"' + student.username + '" is already in this class.'
								});
							} else {
								// Create a new hand state to represent the
								// student's hand in their new class
								var nhs = new Hand_State();

								// Populate the new hand state's properties
								nhs.user = student;
								nhs.hand_state = false;
								nhs.admitted = true;

								// Save new hand state
								nhs.save(function(err) {
									if (err) {
										// Handle any error
										Handler.create_action_log_and_handle('Database Error', 1, 'io.js:007395924614236', err);
									}
								});

								// Add hand state to class
								clss.hands.push(nhs);

								// Save class
								clss.save(function(err) {
									if (err) {
										Handler.create_action_log_and_handle('Database Error', 1, 'io.js:131935495084574', err);
									}
								});

								// Add class to hand state
								nhs.class_id = clss.id;

								// Save hand state
								nhs.save(function(err) {
									if (err) {
										Handler.create_action_log_and_handle('Database Error', 1, 'io.js:312191558795059', err);
									}
								});

								// Add the class to the student's list of
								// classes
								student.student_classes.push(clss);

								// Save the student and their classes
								student.save(function(err) {
									if (err) {
										Handler.create_action_log_and_handle('Database Error', 1, 'io.js:176221136140389', err);
									}
								});

								// Notify teacher that student was enrolled
								// successfully
								socket.emit('TeacherEnrollStudentResponse', {
									message : 'Successfully enrolled student with username "' + student.username + '".'
								});

								// Notify everyone that there has been a hand
								// state change
								io.emit('HandStateChange', {
									hand_state_id : nhs.id,
									hand_admitted : nhs.admitted,
									hand_state : nhs.hand_state,
									username : nhs.user.username,
									class_id : nhs.class_id
								});
							}
						});

					});
				}
			}
		});
	}

	/**
	 * A request by a teacher to create a student and enroll them in their class
	 * 
	 * @param socket -
	 *            the socket.io socket to send responses to
	 * @param student_name -
	 *            the username of the new student
	 * @param password -
	 *            the password of the new student
	 * @param cid -
	 *            the class id of the class the new student will be enrolled in
	 * @param school -
	 *            the school the new student will be registered under
	 * @param uid -
	 *            the user id of the teacher making the creation request
	 */
	function createStudent(socket, student_name, password, cid, school, uid) {
		// Attempt to find a user with the same user name being requested for
		if (!student_name || student_name == null || student_name == "") {
			return;
		}
		// the new student
		User.findOne({
			'username' : student_name
		}, function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:447561887233362', err);
			}
			// check to see if there is already a user with that user name
			if (user) {
				// If there is, notify the teacher that the student was not
				// registered because the username is taken
				socket.emit('TeacherCreateStudentResponse', {
					message : 'Failed to create student with username "' + student_name + '" because there is already a user with that username. Trying to enroll the student.'
				});
				enrollStudent(socket, user.id, cid, uid);
			} else {

				// if there is no user with that username create the user
				var newUser = new User();

				// set the user's credentials
				newUser.username = student_name;
				newUser.password = newUser.generateHash(password);
				newUser.email = "";
				newUser.cellphone = "";
				newUser.school = school;
				newUser.is_student = true;
				newUser.is_teacher = false;
				newUser.is_admin = false;

				// Save the user
				newUser.save(function(err) {
					if (err) {
						Handler.create_action_log_and_handle('Database Error', 1, 'io.js:809661517325781', err);
					}

					// When the user is saved, find the teacher
					User.findById(uid).populate('teacher_classes').exec(function(err, teacher) {
						if (err) {
							// Handle any error
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:434589017625683', err);
						}
						if (teacher !== null) {
							var clss = null;

							// Find the teacher's class
							for (var i = 0; i < teacher.teacher_classes.length; i++) {
								if (teacher.teacher_classes[i].id == cid) {
									clss = teacher.teacher_classes[i];
									break;
								}
							}

							if (clss !== null) {

								// Create a new hand state to represent the
								// student in the class
								var nhs = new Hand_State();
								nhs.user = newUser;
								nhs.hand_state = false;
								nhs.admitted = true;

								// Add the new hand state to the class
								clss.hands.push(nhs);

								// Save the class with the new hand state
								clss.save(function(err) {
									if (err) {
										Handler.create_action_log_and_handle('Database Error', 1, 'io.js:075990466450126', err);
									} else {

										// Save the new hand state
										nhs.class_id = clss.id;
										nhs.save(function(err) {
											if (err) {
												Handler.create_action_log_and_handle('Database Error', 1, 'io.js:008867997502020', err);
											} else {

												// Add the class to the new
												// user's list of classes

												newUser.student_classes.push(clss);

												// Save the new user
												newUser.save(function(err) {
													if (err) {
														Handler.create_action_log_and_handle('Database Error', 1, 'io.js:210435848976879', err);
													} else {

														// Alert the teacher
														// that the student was
														// successfully created
														socket.emit('TeacherCreateStudentResponse', {
															message : 'Successfully created student with username "' + student_name + '".'
														});
													}
												});
											}
										});
									}
								});

							}
						}
					});

				});

			}

		});
	}

	function changePassword(socket, uid, oldPass, newPass) {
		User.findById(uid).exec(function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:1234567890', err);
			}
			if (user.validPassword(oldPass)) {
				user.password = user.generateHash(newPass);
				user.save(function(err) {
					if (err) {
						Handler.create_action_log_and_handle('Database Error', 1, 'io.js:511117224677636', err);
					}
				});
				socket.emit('ChangePasswordResponse', {
					message : 'Your password was changed successfully!'
				});
			} else {
				socket.emit('ChangePasswordResponse', {
					message : 'Your current password is incorrect!'
				});
			}
		});
	}

	function changeStudentPassword(socket, uid, hid, newPass) {
		Hand_State.findById(hid).exec(function(err, hand) {
			User.findById(hand.user).exec(function(err, user) {
				if (err) {
					Handler.create_action_log_and_handle('Database Error', 1, 'io.js:0123456789', err);
				}
				console.log(user);
				user.password = user.generateHash(newPass);
				user.save();
				socket.emit('ChangeStudentPasswordResponse', {
					message : user.username + '\'s password was changed successfully!'
				});
			});
		});
	}

	function sendSchools(socket) {
		User.find().exec(function(err, users) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:848812459104364', err);
			}
			var schools = [];
			for (var i = 0; i < users.length; i++) {
				var school = users[i].school;
				if (!school)
					continue;
				var haveSchool = false;
				for (var j = 0; j < schools.length; j++) {
					if (schools[j] == school) {
						haveSchool = true;
						break;
					}
				}

				if (!haveSchool) {
					schools.push(school);
				}
			}
			var emit = "";
			for (var k = 0; k < schools.length; k++) {
				emit += "<option class=\"form-control\" value=\"" + schools[k] + "\">" + schools[k] + "</option>\n";
			}
			socket.emit("SendSchools", {
				schools : emit
			});
		});
	}

	function sendTeachers(socket, schl) {
		User.find().exec(function(err, users) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:668743921991855', err);
			}
			var teachers = [];
			for (var i = 0; i < users.length; i++) {
				if (!users[i].is_teacher || users[i].school != schl) {
					continue;
				}
				var haveTeacher = false;
				for (var j = 0; j < teachers.length; j++) {
					if (teachers[j] == users[i]) {
						haveTeacher = true;
						break;
					}
				}

				if (!haveTeacher) {
					teachers.push(users[i]);
				}
			}
			var emit = "";
			for (var k = 0; k < teachers.length; k++) {
				emit += "<option class=\"form-control\" value=\"" + teachers[k].id + "\">" + teachers[k].username + "</option>\n";
			}
			socket.emit("SendTeachers", {
				teachers : emit
			});
		});
	}

	function sendStudents(socket, schl, cid) {
		User.find().sort({
			username : "ascending"
		}).populate('student_classes').exec(function(err, users) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:859650889043579', err);
			}
			var students = [];
			for (var i = 0; i < users.length; i++) {
				if (!users[i].is_student || users[i].school != schl) {
					continue;
				}
				var inClass = false;
				for (var j = 0; j < users[i].student_classes.length; j++) {
					if (users[i].student_classes[j].id == cid) {
						inClass = true;
					}
				}

				if (!inClass) {
					students.push(users[i]);
				}
			}
			var emit = "";
			for (var k = 0; k < students.length; k++) {
				emit += "<option class=\"form-control\" value=\"" + students[k].id + "\">" + students[k].username + "</option>\n";
			}
			socket.emit("SendStudentsBySchool", {
				students : emit
			});
		});
	}

	function sendClasses(socket, tid, uid) {
		User.findById(tid).deepPopulate("teacher_classes teacher_classes.id teacher_classes.hands").exec(

		function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:533374528926518', err);
			}
			var classes = [];
			for (var i = 0; i < user.teacher_classes.length; i++) {
				var haveClass = false;

				for (var k = 0; k < user.teacher_classes[i].hands.length; k++) {
					if (user.teacher_classes[i].hands[k].user == uid) {
						haveClass = true;
					}
				}
				if (!haveClass) {
					classes.push(user.teacher_classes[i]);
				}
			}
			var emit = "";
			for (var f = 0; f < classes.length; f++) {
				emit += "<option class=\"form-control\" value=\"" + classes[f].id + "\">" + classes[f].classname + "</option>\n";
			}
			socket.emit("SendTeacherClasses", {
				teachers : emit
			});
		});
	}

	function createKey(uid, code, classes) {
		User.findById(uid).exec(function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:472773673051896', err);
			}
			if (user.is_admin) {
				var keycode = new Key_Code();
				keycode.key_code_hash = keycode.generateHash(code);
				keycode.additional_classes_allowable = classes;
				keycode.save(function(err) {
					if (err) {
						Handler.create_action_log_and_handle('Database Error', 1, 'io.js:729600410308467', err);
					}
				});
			}
		});
	}

	function addClassKey(socket, sid, uid, class_key) {
		User.findById(uid).exec(function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:802364541590542', err);
			}
			Key_Code.find().exec(function(err, keys) {
				if (err) {
					Handler.create_action_log_and_handle('Database Error', 1, 'io.js:963047625677066', err);
				}
				var keyfound = false;
				for (var i = 0; i < keys.length; i++) {
					if (!keys[i].used && keys[i].validKey(class_key)) {

						keyfound = true;

						keys[i].used = true;
						user.allowed_classes += keys[i].additional_classes_allowable;
						user.save(function(err) {
							if (err) {
								Handler.create_action_log_and_handle('Database Error', 1, 'io.js:739394243806652', err);
							}
							socket.emit("AddClassKeyResponse", {
								id : sid,
								message : 'Successfully added ' + keys[i].additional_classes_allowable + ' classes to your account!'
							});

							keys[i].save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:750330596811097', err);
								}
							});
						});
						break;
					}
				}
				if (!keyfound) {
					socket.emit("AddClassKeyResponse", {
						id : sid,
						message : 'Failed to validate key. Either the key you submitted does not exist or it has been used already.'
					});
				}
			});
		});
	}

	function changeClassName(socket, cid, classname, sid, uid) {
		if (classname === "") {
			socket.emit('ChangeClassNameResponse', {
				id : sid,
				message : 'Class name was not changed: classname cannot be blank.'
			});
		} else {
			User.findById(uid).populate('teacher_classes').exec(function(err, user) {
				if (err) {
					Handler.create_action_log_and_handle('Database Error', 1, 'io.js:758973995873303', err);
				}
				var classnamematch = false;
				for (var i = 0; i < user.teacher_classes.length; i++) {
					if (classname == user.teacher_classes[i].classname) {
						classnamematch = true;
					}
				}
				if (classnamematch) {
					socket.emit('ChangeClassNameResponse', {
						id : sid,
						message : 'Class name was not changed: you already have a class with this name.'
					});
				} else {
					Class.findById(cid).exec(function(err, clss) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:450577521837344', err);
						}
						clss.classname = classname;
						clss.save(function(err) {
							if (err) {
								Handler.create_action_log_and_handle('Database Error', 1, 'io.js:778076566150659', err);
							}
						});
						socket.emit('ChangeClassNameResponse', {
							id : sid,
							message : 'Class name changed successfully. Refresh all pages for changes to take effect.'
						});
					});
				}
			});
		}
	}

	function removeStudent(socket, hand_state_id) {
		Hand_State.findById(hand_state_id).populate('user class_id').exec(function(err, hand) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:575939370491691', err);
			}
			for (var i = 0; i < hand.user.student_classes.length; i++) {
				if (hand.user.student_classes[i] == hand.class_id.id) {

					hand.user.student_classes.splice(i, 1);
					i--;

					hand.user.save(function(err) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:920448358245551', err);
						}
					});
				}
			}
			for (var j = 0; j < hand.class_id.hands.length; j++) {
				if (hand.class_id.hands[j] == hand.id) {

					hand.class_id.hands.splice(j, 1);
					hand.class_id.save(function(err) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:214493071991430', err);
						}
					});

				}
			}
		});

		Hand_State.findByIdAndRemove(hand_state_id).exec(function(err) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:', err);
			} else {
				// io.emit used to broadcast to all users
				io.emit("HandRemoved", {
					hand_state : hand_state_id
				});
			}
		});
	}

	function admit(socket, hand_id) {
		Hand_State.findById(hand_id).populate("user").exec(function(err, hand) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:381674997967975', err);
			}
			hand.admitted = true;
			hand.save(function(err) {
				if (err) {
					Handler.create_action_log_and_handle('Database Error', 1, 'io.js:961836459711897', err);
				}
			});
			// io.emit used to broadcast to all users
			io.emit('HandStateChange', {
				hand_state_id : hand_id,
				hand_admitted : hand.admitted,
				hand_state : hand.hand_state,
				username : hand.user.username,
				class_id : hand.class_id
			});
		});
	}

	function changeHand(socket, hand_id) {
		Hand_State.findById(hand_id).populate("user").exec(function(err, hand) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:679984643057804', err);
			}
			if (hand.admitted) {
				hand.hand_state = !hand.hand_state;
				hand.save(function(err) {
					if (err) {
						Handler.create_action_log_and_handle('Database Error', 1, 'io.js:490379174517760', err);
					}
				});
				io.emit('HandStateChange', {
					hand_state_id : hand_id,
					hand_admitted : hand.admitted,
					hand_state : hand.hand_state,
					username : hand.user.username,
					class_id : hand.class_id
				});
			}
		});
	}

	function sendInitialHand(socket, sid, handstate_id) {
		Hand_State.findById(handstate_id).exec(function(err, hand) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:264838270409490', err);
			}
			socket.emit('SendInitialHand', {
				id : sid,
				hand_admitted : hand.admitted,
				hand_state : hand.hand_state
			});
		});
	}

	function enroll2(socket, sid, class_key, user_id) {
		Class.findOne({
			'classKey' : class_key
		}).exec(function(err, clss) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():1', err);
			} else {
				if (clss === null) {
					socket.emit('EnrollResponse', {
						id : sid,
						success : false,
						message : 'That class key does not match any class available, please check with your teacher to ensure you have the correct key.'
					});
					return;
				} else {
					User.findById(user_id).populate("student_classes").exec(function(err, student) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():2', err);
						}
						var inClass = false;
						for (var i = 0; i < student.student_classes.length; i++) {
							if (student.student_classes[i].id == clss.id) {
								inClass = true;
							}
						}
						if (inClass) {
							socket.emit('EnrollResponse', {
								id : sid,
								success : false,
								message : 'You are already in that class!'
							});
						} else {
							var nhs = new Hand_State();
							nhs.user = student;
							nhs.hand_state = false;
							nhs.admitted = true;
							nhs.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():3', err);
								}
							});

							clss.hands.push(nhs);
							clss.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():4', err);
								}
							});

							nhs.class_id = clss.id;
							nhs.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():5', err);
								}
							});

							student.student_classes.push(clss);
							student.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:enroll2():6', err);
								}
							});
							socket.emit('EnrollResponse', {
								id : sid,
								success : true,
								message : 'Success'
							});

							io.emit('HandStateChange', {
								hand_state_id : nhs.id,
								hand_admitted : nhs.admitted,
								hand_state : nhs.hand_state,
								username : nhs.user.username,
								class_id : nhs.class_id
							});
						}
					});
				}
			}
		});
	}

	function enroll(socket, teacher_id, class_id, user_id, sid) {
		User.findById(teacher_id).populate('teacher_classes').exec(function(err, teacher) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:165119239129996', err);
			}
			if (teacher === null) {
				socket.emit('EnrollResponse', {
					id : sid,
					success : false,
					message : 'That teacher does not exist!'
				});
				return;
			} else {
				var clss = null;

				for (var i = 0; i < teacher.teacher_classes.length; i++) {
					if (teacher.teacher_classes[i].id == class_id) {
						clss = teacher.teacher_classes[i];
						break;
					}
				}

				if (clss === null) {
					socket.emit('EnrollResponse', {
						id : sid,
						success : false,
						message : 'That teacher does not have a class with that name!'
					});
					return;
				} else {
					User.findById(user_id).populate("student_classes").exec(function(err, student) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:757637538169520', err);
						}
						var inClass = false;
						for (var i = 0; i < student.student_classes.length; i++) {
							if (student.student_classes[i].id == class_id) {
								inClass = true;
							}
						}
						if (inClass) {
							socket.emit('EnrollResponse', {
								id : sid,
								success : false,
								message : 'You are already in that class!'
							});
						} else {
							var nhs = new Hand_State();
							nhs.user = student;

							nhs.hand_state = false;
							nhs.admitted = false;
							nhs.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:111951257778211', err);
								}
							});

							clss.hands.push(nhs);
							clss.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:395199462408641', err);
								}
							});

							nhs.class_id = clss.id;
							nhs.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:878431514713712', err);
								}
							});

							student.student_classes.push(clss);
							student.save(function(err) {
								if (err) {
									Handler.create_action_log_and_handle('Database Error', 1, 'io.js:757758223222734', err);
								}
							});
							socket.emit('EnrollResponse', {
								id : sid,
								success : true,
								message : 'Success'
							});

							io.emit('HandStateChange', {
								hand_state_id : nhs.id,
								hand_admitted : nhs.admitted,
								hand_state : nhs.hand_state,
								username : nhs.user.username,
								class_id : nhs.class_id
							});
						}
					});
				}
			}
		});
	}

	function sendHands(socket, classes, user_id, sid) {
		var terms = [];
		for (var i = 0; i < classes.length; i++) {
			terms.push({
				class_id : classes[i]
			});
		}
		Hand_State.find().or(terms).sort({
			time_stamp : 'ascending'
		}).populate("user class_id").exec(function(err, hands) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:807356127460951', err);
			}
			for (var i = 0; i < hands.length; i++) {
				var hand = hands[i];
				if (hand.hand_state) {
					var opt = '<option class=\"\" value="' + hand.id + '">' + hand.user.username + '</option>';
					socket.emit("SendHandsForClasses", {
						id : sid,
						hand : opt
					});
				}
			}
		});
	}

	function sendAllHands(socket, classes, user_id, sid) {
		User.findById(user_id).populate('teacher_classes').exec(function(err, user) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:285014767565509', err);
			}
			var index = -1;
			var count = 0;

			for (var j = 0; j < classes.length; j++) {

				var clss = classes[j];

				for (var i = 0; i < user.teacher_classes.length; i++) {
					if (user.teacher_classes[i].id == clss) {
						index = i;
					}
				}

				for (var k = 0; k < user.teacher_classes[index].hands.length; k++) {
					Hand_State.findById(user.teacher_classes[index].hands[k]).populate('user').exec(function(err, doc) {
						if (err) {
							Handler.create_action_log_and_handle('Database Error', 1, 'io.js:758632953328925', err);
						}
						var opt = '<option class="form-control" value="' + doc.id + '">' + doc.user.username + '</option>';
						socket.emit("SendAdmittedHand", {
							id : sid,
							hand : opt
						});
					});
					count++;
				}
			}
		});
	}
	
	function sendRandomStudent(socket, classes) {
		var terms = [];
		for (var i = 0; i < classes.length; i++) {
			terms.push({
				class_id : classes[i]
			});
		}
		Hand_State.find().or(terms).populate("user").exec(function(err, hands) {
			if (err) {
				Handler.create_action_log_and_handle('Database Error', 1, 'io.js:sendRandomStudent', err);
			}
			var count = hands.length
			var random = Math.floor(Math.random() * count)
			socket.emit('SendRandomStudent', {
				randomStudentName:hands[random].user.username
			});
		});
	}

};