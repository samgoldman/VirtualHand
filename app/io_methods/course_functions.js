const Course = require('../models/course').model;
const User = require('../models/user').model;

const createCourse = async (socket, uid, courseName) => {
	const user = await User.findById(uid);
	const data = {success: false};

	if (!user) {
		data.message = 'Class not created: user ID is invalid';
	} else if (!courseName || courseName === "") {
		data.message = 'Class not created: Name must not be blank!';
	} else {
		uid = user._id;
		const course = await Course.create({courseName: courseName, teacher: uid});

		data.courseId = course._id;
		data.courseName = courseName;
		data.message = 'Class created successfully.';
		data.success = true;
	}

	socket.emit('Response_CourseCreate', data);
}

module.exports = {
	createCourse: createCourse
}
