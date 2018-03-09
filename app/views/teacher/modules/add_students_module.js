function AddStudentsClicked() {
	let csv = document.getElementById('addStudentsCSV').value;
	let defaultPassword = document.getElementById('addStudentsDefaultPassword').value;
	socket.emit('Request_AddStudents', {
		cid: getSelectedClassId(),
		csv: csv,
		defaultPassword: defaultPassword
	});
}

socket.on('Response_AddStudents', function (data) {
	console.log('AddStudents Response');
	document.getElementById("enrollAlert").innerHTML += '<p>' + data.message + '</p>';
	document.getElementById("enrollAlert").style.display = "block";
});

window.addEventListener("load", function () {
	$('#addStudentsSubmit').each(function () {
		this.addEventListener('click', AddStudentsClicked);
	});
});