const EnrollClicked = () => {
	socket.emit('Request_EnrollStudent', {
		courseKey: document.querySelector('#course_key').value
	});
};

const handleEnrollStudentResponse = data => {
	const alert_box = document.querySelector('#enroll_alert_box');
	alert_box.innerHTML = data.message;
	alert_box.style.display = block;
};

const EnrollModuleInit = () => {
	socket.on('Response_EnrollStudent', handleEnrollStudentResponse);
	document.querySelector('#enroll_submit').addEventListener('click', EnrollClicked);
};

window.addEventListener("load", EnrollModuleInit);