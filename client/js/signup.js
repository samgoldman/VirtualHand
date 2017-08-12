var socket = io.connect()
socket.on('SendSchools', function(data) {
	document.getElementById("schools").innerHTML += data.schools;
});

socket.emit('GetSchools', {});

function accountTypeChange() {
	if (document.getElementById('type_student').checked) {
		document.getElementById('newschool').disabled = true;
	} else if (document.getElementById('type_teacher').checked) {
		document.getElementById('newschool').disabled = false;
	}
}