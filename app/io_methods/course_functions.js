const Course = require('../models/course').model;
const User = require('../models/user').model;

const createCourse = async (socket, uid, courseName) => {
	const user = await User.findById(uid);
	uid = user._id;
	const data = {};

	if (!courseName || courseName === "") {
		data.message = "Class not created: Name must not be blank!";
		data.success = false;
	} else {
		let newCourse = new Course();
		newCourse.courseName = courseName;
		newCourse.teacher = uid;
		await newCourse.save();

		data.courseId = newCourse._id;
		data.courseName = courseName;
		data.message = 'Class created successfully.';
		data.success = true;
	}

	socket.emit('Response_CourseCreate', data);
}

module.exports = {
	createCourse: createCourse
}
