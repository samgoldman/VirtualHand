function UpdateRandomStudentSelector(options) {
	document.getElementById('randomStudentButtons').innerHTML = "<p><strong>Select a random student:</strong></p>";
	for (let i = 0; i < options.length; i++) {
		if (options[i].selected) {
			let newDiv = document.createElement('div');
			newDiv.className = "unselectable listItem";
			newDiv.innerHTML = options[i].innerHTML;
			newDiv.setAttribute('value', options[i].value);
			newDiv.setAttribute('onclick', "RequestRandomStudent('" + options[i].value + "')");
			document.getElementById('randomStudentButtons').appendChild(newDiv);
			document.getElementById('randomStudentButtons').appendChild(document.createElement('div'));
		}
	}
}

function RequestRandomStudent(cid) {
	socket.emit('Request_RandomStudent', {cid: cid});
}

socket.on("Response_RandomStudent", function (data) {
	if (document.getElementById('random_student') !== null) {
		document.getElementById('random_student').innerHTML = '<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: ' + data.randomStudentName
	}
	else {
		document.getElementById('randomStudentButtons').innerHTML += '<div id="random_student" class="alert alert-info alert-dismissable">' +
			'<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: ' + data.randomStudentName + '</div>';
	}
});