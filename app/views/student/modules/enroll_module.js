function EnrollClicked() {
	$('#course_key').each(function () {
		let key = this.value;

		socket.emit('Request_EnrollStudent', {
			sid: document.getElementById('user_id').value,
			courseKey: key
		});
	});
}

socket.on('Response_EnrollStudent', function (data) {
	document.getElementById("enroll_alert_box").innerHTML = data.message;
	document.getElementById("enroll_alert_box").style.display = "block";
});

window.addEventListener("load", function () {
	$('#enroll_submit').each(function () {
		this.addEventListener('click', EnrollClicked);
	});
});