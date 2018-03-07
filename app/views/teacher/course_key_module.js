function RequestKey() {
	socket.emit('Request_RetrieveCourseKey', {cid: getSelectedClassId()});
}

socket.on('Response_RetrieveCourseKey', function (data) {
	$('#course_key_header').text(data.key);
});

function RequestNewKey() {
	socket.emit('Request_AssignNewCourseKey', {cid: getSelectedClassId()});
}

socket.on('Response_AssignNewCourseKey', function () {
	RequestKey();
});

window.addEventListener("load", function () {
	$('#class_key_button').click(RequestKey);
	$('#new_key_button').click(RequestNewKey);
});