function RenameClassClicked() {
	socket.emit('Request_CourseRename', {
		cid: getSelectedClassId(),
		newCourseName: document.querySelector('#class_rename').value
	});
}

function handleResponseRenameCourse(data) {
	document.querySelector("#rename_class_alert_box").innerHTML = data.message;
	document.querySelector("#rename_class_alert_box").style.display = "block";
	if (data.success) {
		RenameClass(data.courseId, data.courseName);
	}
};

function clearRenameClassModal() {
	document.querySelector('#class_rename').value = '';
	document.querySelector("#rename_class_alert_box").innerHTML = "";
	document.querySelector("#rename_class_alert_box").style.display = "none";
}

function initRenameClassModule() {
	socket.on('Response_RenameCourse', handleResponseRenameCourse);
	document.querySelector('#rename_class_submit').addEventListener('click', RenameClassClicked);
	$(".rename-class-modal").on("hidden.bs.modal", initRenameClassModule);
}

window.addEventListener("load", initRenameClassModule);
