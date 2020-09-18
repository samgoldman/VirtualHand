function NewClassClicked() {
	socket.emit('Request_CourseCreate', {
		courseName: document.querySelector('#new_class_name').value() 
	});
};

function HandleResponseCourseCreate(data) {
	document.querySelector("#create_class_alert_box").innerHTML = data.message;
	document.querySelector("#create_class_alert_box").style.display = "block";
	if (data.message.indexOf("success") > -1) {
		AddClass(data.courseId, data.courseName);
	}
};

function ClearAddClassModal() {
	document.querySelector('#new_class_name').value = '';
	document.querySelector("#create_class_alert_box").innerHTML = "";
	document.querySelector("#create_class_alert_box").style.display = "none";
}

function InitAddClassModule() {
	document.querySelector('#new_class_submit').addEventListener('click', NewClassClicked);
	$(".create-class-modal").on("hidden.bs.modal", ClearAddClassModal);
	socket.on('Response_CourseCreate', HandleResponseCourseCreate);
};

window.addEventListener("load", InitAddClassModule);