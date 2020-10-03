function UpdateRandomStudentSelector() {
	const buttonsDiv = document.querySelector('#randomStudentButtons')
	buttonsDiv.innerHTML = "<h5><strong>Select a random student:</strong></h5>";
	document.querySelectorAll('#class_selector option:checked').forEach(option => {
		buttonsDiv.innerHTML += `<div class='unselectable listItem' value='${option.value}' onclick='RequestRandomStudent("${option.value}")'>${option.innerHTML}</div><div></div>`;
	});
}

function RequestRandomStudent(cid) {
	socket.emit('Request_RandomStudent', {cid: cid});
}

function handleResponseRandomStudent(data) {
	if (document.querySelector('#random_student') !== null) {
		document.querySelector('#random_student').innerHTML = `<a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: ${data.randomStudentName}`;
	} else {
		document.querySelector('#randomStudentButtons').innerHTML += `<div id="random_student" class="alert alert-info alert-dismissable"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a> Random student: ${data.randomStudentName}</div>`;
	}
}

function initRandomStudentSelector() {
	socket.on("Response_RandomStudent", handleResponseRandomStudent);
	document.querySelector('#class_selector').addEventListener('change', UpdateRandomStudentSelector);
}

window.addEventListener("load", initRandomStudentSelector);