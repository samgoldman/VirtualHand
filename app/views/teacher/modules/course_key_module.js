function RequestKey() {
	socket.emit('Request_RetrieveCourseKey', {cid: getSelectedClassId()});
}

function RequestNewKey() {
	socket.emit('Request_AssignNewCourseKey', {cid: getSelectedClassId()});
}

function HandleResponseRetrieveCourseKey(data) {
	document.querySelector('#course_key_header').innerText = data.key;
}

const CourseKeyModuleInit = () => {
	document.querySelector('#class_key_button').addEventListener('click', RequestKey);
	document.querySelector('#new_key_button').addEventListener('click', RequestNewKey);

	socket.on('Response_AssignNewCourseKey', RequestKey);
	socket.on('Response_RetrieveCourseKey', HandleResponseRetrieveCourseKey);
};

window.addEventListener("load", CourseKeyModuleInit);