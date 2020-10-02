function DeleteCourseConfirmClassname() {
	if(document.querySelector('#class_selector option:checked').textContent === document.querySelector('#delete_class_confirm').value) {
		document.querySelector('#delete_class_submit').removeAttribute('disabled');
	} else {
		document.querySelector('#delete_class_submit').setAttribute('disabled', 'disabled');
	}
}

function DeleteCourse() {
	socket.emit('Request_DeleteCourse', {cid: getSelectedClassId()});
}

function handleDeleteCourseResponse(data) {
	document.querySelector("#delete_class_alert_box").innerHTML = data.message;
	document.querySelector("#delete_class_alert_box").style.display = "block";
	document.querySelector('#delete_class_confirm').value = '';
	RemoveClass(getSelectedClassId());
}

function clearDeleteCourseModal() {
	document.querySelector("#delete_class_alert_box").innerHTML = '';
	document.querySelector("#delete_class_alert_box").style.display = "none";
	document.querySelector("#delete_class_confirm").value = '';
}

function populateDeleteCourseModule() {
	document.querySelector('#delete_class_classname').innerText = document.querySelector('#class_selector option:checked').textContent;
}

function initDeleteCourseModule() {
	document.querySelector('#delete_class_button').addEventListener('click', populateDeleteCourseModule);
	document.querySelector('#delete_class_confirm').addEventListener('keyup', DeleteCourseConfirmClassname);
	document.querySelector('#delete_class_submit').addEventListener('click', DeleteCourse);
	$(".delete-class-modal").on("hidden.bs.modal", clearDeleteCourseModal);
	socket.on('Response_DeleteCourse', handleDeleteCourseResponse);
}

window.addEventListener("load", initDeleteCourseModule);