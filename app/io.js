// Load the models
var User = require('./models/user').model;
var Hand = require('./models/hand');
var Room = require('./models/room').model;

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

        //Public
        socket.on('ContactUs', function () {
            // Use action_log_handler to email admin w/ name, email and message
            // TODO
        });
        socket.on('RecoverPassword', function (data) {
            recoverPassword(socket, data.user_name);
        });

        //User
        socket.on('ChangePassword', function (data) {
            changePassword(socket, data.user_id, data.oldPass, data.newPass);
        });


        //Admin
        socket.on('GetLoggedInCount', function () {
            socket.emit('LoggedInCount', {count: userCount});
        });
        socket.on('CreateMessage', function (data) {
            createMessage(data.name, data.message);
        });

        //Teacher
        socket.on('CreateClass', function (data) {
            createRoom(socket, data.user_id, data.classname);
        });
        socket.on('GetClassKey', function (data) {
            getRoomKey(socket, data.class_id);
        });
        socket.on('ChangeClassKey', function (data) {
            changeClassKey(socket, data.class_id, data.newkey);
        });
        socket.on('ChangeStudentPassword', function (data) {
            changeStudentPassword(socket, data.student_id, data.new_password);
        });
        socket.on('ChangeClassName', function (data) {
            changeClassName(socket, data.class_id, data.new_classname, data.id, data.user_id);
        });
        socket.on('GetHandsForClasses', function (data) {
            sendHands(socket, data.classes, data.id);
        });
        socket.on('AdmitToClass', function (data) {
            admit(data.hand_state_id);
        });
        socket.on('GetAllHandsForClasses', function (data) {
            sendAllHands(socket, data.classes, data.user_id, data.id);
        });
        socket.on('RemoveStudent', function (data) {
            removeStudent(data.hand_state_id);
        });
        socket.on('TeacherCreateStudent', function (data) {
            createStudent(socket, data.student_name, data.password, data.class_id, data.user_id);
        });
        socket.on('TeacherEnrollStudent', function (data) {
            enrollStudent(socket, data.student_id, data.class_id, data.user_id);
        });
        socket.on('GetRandomStudent', function (data) {
            sendRandomStudent(socket, data.classes);
        });

        //Student
        socket.on('ChangeHand', function (data) {
            changeHand(data.handstate_id).then(function (data) {
                io.emit('HandStateChange', data);
            });
        });
        socket.on('Enroll', function (data) {
            enroll(socket, data.id, data.class_key, data.user_id);
        });
        socket.on('GetInitialHand', function (data) {
            sendInitialHand(data.id, data.handstate_id).then(function (data) {
                socket.emit('SendInitialHand', data);
            });
        });
    });

    function recoverPassword(socket, username) {
        User.findOne({'username': username})
            .exec()
            .then(function (user) {
                if (!user) {
                    return "There is no record of a user with that username.";
                }
                if (user.is_student) {
                    return "The system cannot reset passwords for students. Please contact your teacher, who can reset your password.";
                }
                if (user.email === "") {
                    return "The system does not have an email for your account, which means you are not a paid subscriber. Please contact Virtual Hand support at sgoldman216@gmail.com with your username to have your account recovered.";
                }

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

                return "Your password has been reset. Please check your email (" + user.email + ") to receive your new password.";
            })
            .then(function (message) {
                socket.emit('RecoverPasswordResponse', {
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
            .exec()
            .then(function (user) {
                return user;
            })
            .catch(function (err) {
                console.log(err);
                // TODO Log error
            })
            .then(function (user) {
                if (user.validPassword(oldPassword)) {
                    user.password = user.generateHash(newPassword);
                    return Promise.cast(user.save());
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
                socket.emit('ChangePasswordResponse', {
                    message: message
                });
            });
    }


    function createMessage(n, m) {
        var data = {name: n, message: m, sent: false};
        User.find({isTeacher: true})
            .exec()
            .then(function (users) {
                for (var i = 0; i < users.length; i++) {
                    users[i].metaData.push(data);
                    users[i].save();
                }
            })
            .catch(function (err) {
                console.log(err);
                // TODO Handle err
            });
    }


    function createRoom(socket, user_id, roomname) {
        User.findById(user_id).populate("teacher_classes")
            .exec()
            .then(function (user) {
                for (var i = 0; i < user.teacher_classes.length; i++) {
                    if (user.teacher_classes[i].classname === roomname) {
                        return "Class not created: you already have a class of this name!";
                    }
                }

                var newRoom = new Room();
                newRoom.classname = roomname;
                newRoom.hands = [];

                newRoom.save();
                user.teacher_classes.push(newRoom.id);
                user.save();
                return "Class created successfully!";
            })
            .catch(function (err) {
                console.log(err);
                // TODO catch error
            })
            .then(function (message) {
                socket.emit('CreateClassResponse', {
                    message: message
                });
            });
    }

    function getRoomKey(socket, room_id) {
        Room.findById(room_id)
            .exec()
            .then(function (room) {
                if (!room.classKey) {
                    createNewKey(function (newkey) {
                        room.classKey = newkey;
                        room.save();
                    });
                } else {
                    socket.emit('SendClassKey', {
                        key: room.classKey
                    });
                }
            })
            .catch(function (err) {
                console.log(err);
                // TODO catch err
            });
    }

    function changeClassKey(socket, class_id, newkey) {
        verifyNewKey(newkey, function (valid) {
            if (valid) {
                Room.findById(class_id)
                    .exec()
                    .then(function (room) {
                        room.classKey = newkey;
                        room.save();
                        getRoomKey(socket, class_id);
                    });
            }
            socket.emit('ChangeClassKeyResponse', {
                success: valid
            });
        });
    }

    function createNewKey(callback) {
        var newKey = randomstring.generate(4);
        Room.findOne({'classKey': newKey})
            .exec()
            .then(function (room) {
                if (!room) {
                    callback(newKey);
                } else {
                    createNewKey(callback);
                }
            })
            .catch(function (err) {
                console.log(err);
                // TODO
            });
    }

    function verifyNewKey(newKey, callback) {
        Room.findOne({'classKey': newKey})
            .exec()
            .then(function (room) {
                callback(!room);
            })
            .catch(function (err) {
                console.log(err);
                // TODO
            });
    }

    function enrollStudent(socket, student_id, room_id, user_id) {
        var room = null;
        var student = null;
        User.findById(user_id)
            .populate('teacher_classes')
            .exec()
            .then(function (teacher) {
                if (teacher !== null) { // If the teacher exists
                    for (var i = 0; i < teacher.teacher_classes.length; i++) {
                        if (teacher.teacher_classes[i].id === room_id) {
                            return teacher.teacher_classes[i];
                        }
                    }
                }
            })
            .then(function (_room) {
                room = _room;
                if (room !== null) {
                    return Promise.cast(User.findById(student_id).populate("student_classes").exec());
                }
            })
            .then(function (_student) {
                student = _student;
                return Hand.getOneHand({user: student_id, class_id: room_id});
            })
            .then(function (hand) {
                if (hand) {
                    socket.emit('TeacherEnrollStudentResponse', {
                        message: '"' + student.username + '" is already in this class.'
                    });
                } else {
                    Hand.createHand(student, false, true, room.id)
                        .then(function (newHand) {

                            room.hands.push(newHand);
                            room.save();

                            student.student_classes.push(room);
                            student.save();

                            socket.emit('TeacherEnrollStudentResponse', {
                                message: 'Successfully enrolled student with username "' + student.username + '".'
                            });

                            io.emit('HandStateChange', {
                                hand_state_id: newHand.id,
                                hand_admitted: newHand.admitted,
                                hand_state: newHand.hand_state,
                                username: newHand.user.username,
                                class_id: newHand.class_id
                            });
                        });
                }
            });
    }

    function createStudent(socket, student_name, password, room_id, uid) {
        if (!student_name || student_name === null || student_name === "") {
            return;
        }
        // the new student
        User.findOne({'username': student_name})
            .exec()
            .then(function (user) {
                if (user) {
                    socket.emit('TeacherCreateStudentResponse', {
                        message: 'Failed to create student with username "' + student_name + '" because there is already a user with that username. Trying to enroll the student.'
                    });
                    enrollStudent(socket, user.id, room_id, uid);
                } else {

                    // if there is no user with that username create the user
                    var newUser = new User();

                    // set the user's credentials
                    newUser.username = student_name;
                    newUser.password = newUser.generateHash(password);
                    newUser.email = "";
                    newUser.is_student = true;
                    newUser.is_teacher = false;
                    newUser.is_admin = false;

                    // Save the user
                    newUser.save(function () {
                        // When the user is saved, find the teacher
                        User.findById(uid).populate('teacher_classes')
                            .exec()
                            .then(function (teacher) {
                                if (teacher !== null) {
                                    var classObject = null;

                                    for (var i = 0; i < teacher.teacher_classes.length; i++) {
                                        if (teacher.teacher_classes[i].id === room_id) {
                                            classObject = teacher.teacher_classes[i];
                                            break;
                                        }
                                    }

                                    if (classObject !== null) {
                                        Hand.createHand(newUser, false, true, classObject.id)
                                            .then(function (newHand) {

                                                classObject.hands.push(newHand);

                                                classObject.save(function () {
                                                    newUser.student_classes.push(classObject);
                                                    newUser.save(function () {
                                                        socket.emit('TeacherCreateStudentResponse', {
                                                            message: 'Successfully created student with username "' + student_name + '".'
                                                        });
                                                    });

                                                });
                                            });
                                    }
                                }
                            });

                    });

                }

            });
    }

    function changeStudentPassword(socket, hand_id, newPass) {
        Hand.getHandById(hand_id)
            .then(function (hand) {
                User.findById(hand.user)
                    .exec()
                    .then(function (user) {
                        console.log(user);
                        user.password = user.generateHash(newPass);
                        user.save();
                        socket.emit('ChangeStudentPasswordResponse', {
                            message: user.username + '\'s password was changed successfully!'
                        });
                    });
            });
    }

    function changeClassName(socket, cid, classname, sid, uid) {
        if (classname === "") {
            socket.emit('ChangeClassNameResponse', {
                id: sid,
                message: 'Class name was not changed: classname cannot be blank.'
            });
        } else {
            User.findById(uid).populate('teacher_classes').exec().then(function (user) {
                var classNameMatch = false;
                for (var i = 0; i < user.teacher_classes.length; i++) {
                    if (classname === user.teacher_classes[i].classname) {
                        classNameMatch = true;
                    }
                }
                if (classNameMatch) {
                    socket.emit('ChangeClassNameResponse', {
                        id: sid,
                        message: 'Class name was not changed: you already have a class with this name.'
                    });
                } else {
                    Room.findById(cid).exec().then(function (classObject) {
                        if (err) {
                        }
                        classObject.classname = classname;
                        classObject.save(function (err) {
                            if (err) {
                            }
                        });
                        socket.emit('ChangeClassNameResponse', {
                            id: sid,
                            message: 'Class name changed successfully. Refresh all pages for changes to take effect.'
                        });
                    });
                }
            });
        }
    }

    function removeStudent(hand_state_id) {
        Hand.getHandByIdAndRemove(hand_state_id)
            .then(function () {
                io.emit("HandRemoved", {
                    hand_state: hand_state_id
                });
            });
    }

    function admit(hand_id) {
        Hand.getHandByIdAndPopulate(hand_id, 'user')
            .then(function (hand) {
                hand.admitted = true;
                hand.save();

                io.emit('HandStateChange', {
                    hand_state_id: hand_id,
                    hand_admitted: hand.admitted,
                    hand_state: hand.hand_state,
                    username: hand.user.username,
                    class_id: hand.class_id
                });
            });
    }

    function sendHands(socket, classes, sid) {
        var terms = [];
        for (var i = 0; i < classes.length; i++) {
            terms.push({
                class_id: classes[i]
            });
        }
        Hand.getSortedHandsAndPopulate(terms, "user")
            .then(function (hands) {
                for (var i = 0; i < hands.length; i++) {
                    var hand = hands[i];
                    if (hand.hand_state) {
                        var opt = '<option class=\"\" value="' + hand.id + '">' + hand.user.username + '</option>';
                        socket.emit("SendHandsForClasses", {
                            id: sid,
                            hand: opt
                        });
                    }
                }
            });
    }

    function sendAllHands(socket, classes, user_id, sid) {
        User.findById(user_id)
            .populate('teacher_classes')
            .exec()
            .then(function (user) {
                var index = -1, count = 0;

                for (var j = 0; j < classes.length; j++) {
                    var classObject = classes[j];
                    for (var i = 0; i < user.teacher_classes.length; i++) {
                        if (user.teacher_classes[i].id === classObject) {
                            index = i;
                        }
                    }

                    for (var k = 0; k < user.teacher_classes[index].hands.length; k++) {
                        Hand.getHandByIdAndPopulate(user.teacher_classes[index].hands[k], 'user')
                            .then(function (doc) {
                                var opt = '<option class="form-control" value="' + doc.id + '">' + doc.user.username + '</option>';
                                socket.emit("SendAdmittedHand", {
                                    id: sid,
                                    hand: opt
                                });
                            })
                            .catch(function(err){
                                console.log("Error: " + err);
                                // TODO
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
                class_id: classes[i]
            });
        }
        Hand.getHandsAndPopulate(terms, "user")
            .then(function (hands) {
                var count = hands.length;
                if (count > 0) {
                    var random = Math.floor(Math.random() * count);
                    socket.emit('SendRandomStudent', {
                        randomStudentName: hands[random].user.username
                    });
                } else {
                    socket.emit('SendRandomStudent', {
                        randomStudentName: 'Class is empty!'
                    });
                }
            });
    }


    function changeHand(hand_id) {
        return Hand.getHandByIdAndPopulate(hand_id, "user")
            .then(function (hand) {
                if (hand.admitted) {
                    hand.hand_state = !hand.hand_state;
                }
                return hand;
            })
            .then(Hand.saveHand)
            .then(function (hand) {
                return {
                    hand_state_id: hand_id,
                    hand_admitted: hand.admitted,
                    hand_state: hand.hand_state,
                    username: hand.user.username,
                    class_id: hand.class_id
                };
            });
    }

    function enroll(socket, sid, class_key, user_id) {
        Room.findOne({'classKey': class_key})
            .exec()
            .then(function (classObject) {
                if (classObject === null) {
                    socket.emit('EnrollResponse', {
                        id: sid,
                        success: false,
                        message: 'That class key does not match any class available, please check with your teacher to ensure you have the correct key.'
                    });
                } else {
                    User.findById(user_id).populate("student_classes").exec().then(function (student) {
                        var inClass = false;
                        for (var i = 0; i < student.student_classes.length; i++) {
                            if (student.student_classes[i].id === classObject.id) {
                                inClass = true;
                            }
                        }
                        if (inClass) {
                            socket.emit('EnrollResponse', {
                                id: sid,
                                success: false,
                                message: 'You are already in that class!'
                            });
                        } else {
                            Hand.createHand(student, false, true, classObject)
                                .then(function (newHand) {

                                    classObject.hands.push(newHand);
                                    classObject.save();


                                    student.student_classes.push(classObject);
                                    student.save();
                                    socket.emit('EnrollResponse', {
                                        id: sid,
                                        success: true,
                                        message: 'Success'
                                    });

                                    io.emit('HandStateChange', {
                                        hand_state_id: newHand.id,
                                        hand_admitted: newHand.admitted,
                                        hand_state: newHand.hand_state,
                                        username: newHand.user.username,
                                        class_id: newHand.class_id
                                    });
                                });

                        }
                    });
                }
            });
    }

    function sendInitialHand(student_id, hand_id) {
        return Hand.getHandById(hand_id)
            .then(function (hand) {
                return {
                    id: student_id,
                    hand_admitted: hand.admitted,
                    hand_state: hand.hand_state
                }
            });
    }
};