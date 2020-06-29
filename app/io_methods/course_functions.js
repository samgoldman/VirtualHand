const Course = require('../models/course').model;
const User = require('../models/user').model;
const Enrollment = require('../models/enrollment').model;

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
};

const renameCourse = async (socket, cid, newCourseName) => {
	const response = {success: false};

	if (!newCourseName || newCourseName === "") {
		response.message = 'Class not renamed: Name must not be blank!';
	} else {
		const course = await Course.findById(cid);

		if (!course) {
			response.message = 'Class not renamed: Invalid course ID';
		} else {
			course.courseName = newCourseName;
			await course.save();

			response.success = true;
			response.message = 'Class renamed successfully.';
			response.courseId = course._id;
			response.courseName = course.courseName;
		}
	}

	socket.emit('Response_RenameCourse', response);
};

const deleteCourse = async (socket, uid, cid) => {
	const response = {success: false};

	try {
		await Course.verifyCourseTaughtBy(cid, uid);
		await Enrollment.find({course: cid, valid: true}).updateMany({valid: false});
		await Course.findById(cid).updateOne({valid: false});
		response.success = true;
		response.message = 'Successfully deleted class';
	} catch (err) {
		response.message = err.message;
	}

	socket.emit('Response_DeleteCourse', response);
};

module.exports = {
	createCourse: createCourse,
	renameCourse: renameCourse,
	deleteCourse: deleteCourse
}
