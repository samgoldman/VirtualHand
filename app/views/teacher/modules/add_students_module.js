function AddStudentsClicked() {
	socket.emit('Request_AddStudents', {
		cid: getSelectedClassId(),
		csv: document.querySelector('#addStudentsCSV').value,
		defaultPassword: document.querySelector('#addStudentsDefaultPassword').value
	});
}

function handleResponseAddStudents(data) {
	document.querySelector("#enrollAlert").innerHTML += '<p>' + data.message + '</p>';
	document.querySelector("#enrollAlert").style.display = "block";
}

function clearAddStudentModal() {
	document.querySelector('#addStudentsCSV').value = '';
	document.querySelector('#addStudentsDefaultPassword').value = '';
	document.querySelector("#enrollAlert").innerHTML = '';
	document.querySelector("#enrollAlert").style.display = "none";
}

function addStudentsModuleInit() {
	document.querySelector('#addStudentsSubmit').addEventListener('click', AddStudentsClicked);
	socket.on('Response_AddStudents', handleResponseAddStudents);
	$(".add-students-modal").on("hidden.bs.modal", clearAddStudentModal);
}

window.addEventListener("load", addStudentsModuleInit);