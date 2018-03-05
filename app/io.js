// Load the models
var User = require('./models/user').model;
var Enrollment = require('./models/enrollment');
var Course = require('./models/course').model;
var AssistanceRequest = require('./models/assistanceRequest').model;
var HallPassRequest = require('./models/hallPassRequest').model;

var Promise = require('bluebird');

// Send emails
var nodemailer = require('nodemailer');

// For password resets
var randomstring = require("randomstring");

// app/routes.js
module.exports = function (io) {
    // Create the object used to send the emails
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.VH_EMAIL,
            pass: process.env.VH_EMAIL_PASSWORD
        }
    });

    var userCount = 0;

    // Configure what happens when each event is called
    io.on('connection', function (socket) {
        userCount++;
        socket.on('disconnect', function () {
            userCount--;
        });

        socket.on('Request_RecoverPassword', function (data) {
            recoverPassword(socket, data.user_name);
        });

		//User
		socket.on('Request_PasswordChange', function (data) {
			changePassword(socket, data.uid, data.oldPassword, data.newPassword);
		});

        socket.on('Request_CourseCreate', function(data) {
        	createCourse(socket, data.uid, data.courseName)
		});


    });

    function recoverPassword(socket, username) {
        User.findOne({'username': username})
            .exec()
            .then(function (user) {
                if (!user || !user.email || user.email === "")
                    return "Cannot recover password: either user does not exist or there is no email on record.";

                // TODO: need better password reset method!
                // If all conditions are met, reset the password
                var newPass = randomstring.generate(12);
                user.password = user.generateHash(newPass);
                user.save();
                var email_text = "Virtual Hand has received a request for your account's password to be reset. Your new password is: " + newPass + "\nPlease change it right away.";
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
                return Course.find({teacher: uid, courseName: courseName});
            })
			.then(function (courses) {
				var data = {};
				if (!courseName || courseName === "") {
					data.message = "Class not created: Name must not be blank!";
				} else if (courses.length > 0) {
					data.message = "Class not created: You already have a class with that name.";
				} else {
					var newCourse = new Course();
					newCourse.courseName = courseName;
					newCourse.teacher = uid;
					newCourse.save();

					data.courseId = newCourse._id;
					data.courseName = courseName;
					data.message = "Class created successfully.";
				}
                socket.emit('Response_CourseCreate', data);
            });
    }
};