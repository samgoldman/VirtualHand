function RemoveAllConfirmClassname() {
	if(document.querySelector('#class_selector option:checked').textContent === document.querySelector('#remove_all_class_confirm').value) {
		document.querySelector('#remove_all_students_submit').removeAttribute('disabled');
	} else {
		document.querySelector('#remove_all_students_submit').setAttribute('disabled', 'disabled');
	}
}

function RemoveAllStudents() {
	socket.emit('Request_RemoveAllStudents', {cid: getSelectedClassId()});
}

function handleResponseRemoveAllStudents(data) {
	document.querySelector("#remove_all_students_alert_box").innerHTML = data.message;
	document.querySelector("#remove_all_students_alert_box").style.display = "block";
}

function populateRemoveAllStudentsModal() {
	document.querySelector('#remove_all_students_classname').innerText = document.querySelector('#class_selector option:checked').textContent;
}

function clearRemoveAllStudentsModal() {
	document.querySelector("#remove_all_students_alert_box").innerHTML = '';
	document.querySelector("#remove_all_students_alert_box").style.display = "none";
	document.querySelector('#remove_all_class_confirm').value = '';
}

function initRemoveAllStudentsModule() {
	socket.on('Response_RemoveAllStudents', handleResponseRemoveAllStudents);

	document.querySelector('#remove_all_students_button').addEventListener('click', populateRemoveAllStudentsModal);
	document.querySelector('#remove_all_class_confirm').addEventListener('keyup', RemoveAllConfirmClassname);
	document.querySelector('#remove_all_students_submit').addEventListener('click', RemoveAllStudents);

	$(".remove-all-students-modal").on("hidden.bs.modal", clearRemoveAllStudentsModal);
}

window.addEventListener("load", initRemoveAllStudentsModule);