function StudentSelectorChanged() {
	if (getSelectedStudentOption().className.indexOf('not-admitted') === -1) {
		document.querySelector('#remove_student').removeAttribute("disabled");
		document.querySelector('#new_student_pw').removeAttribute("disabled");
		document.querySelector('#new_student_pw_submit').removeAttribute("disabled");
		document.querySelector('#admit_student').setAttribute("disabled", "disabled");
	} else {
		document.querySelector('#remove_student').removeAttribute("disabled");
		document.querySelector('#new_student_pw').setAttribute("disabled", "disabled");
		document.querySelector('#new_student_pw_submit').setAttribute("disabled", "disabled");
		document.querySelector('#admit_student').removeAttribute("disabled");
	}
}

function RequestStudents() {
	socket.emit('Request_StudentsForClass', {
		cid: getSelectedClassId()
	});
}

function getSelectedStudentOption() {
	return document.querySelector('#student_selector option:checked');
}

function handleReponseGetStudents(data) {
	const student_selector = document.getElementById("student_selector");
	student_selector.innerHTML = "";
	data.enrollments.forEach(enrollment => {
		const option = new Option(enrollment.student.username, enrollment.student._id);
		if (enrollment.admitted === false) {
			option.className = 'bg-info not-admitted ';
		}
		student_selector.add(option);
	});
}

function RemoveStudent() {
	socket.emit('Request_RemoveStudent', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value
	})
}

function AdmitStudent() {
	socket.emit('Request_AdmitStudent', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value
	})
}

function changeStudentPassword() {
	socket.emit('Request_ChangeStudentPassword', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value,
		password: document.querySelector('#new_student_pw').value
	})
}

function handleResponseChangeStudentPassword(data) {
	document.querySelector('#manage_students_alert_box').innerText = data.message;
	document.querySelector('#manage_students_alert_box').style.display = "block";
}

function clearManageStudentsModal() {
	document.querySelector('#manage_students_alert_box').innerText = '';
	document.querySelector('#manage_students_alert_box').style.display = "none";
}

function initManageStudentsModule() {
	document.querySelector('#student_selector').addEventListener('change', StudentSelectorChanged);
	document.querySelector('#manage_students_button').addEventListener('click', RequestStudents);
	document.querySelector('#remove_student').addEventListener('click', RemoveStudent);
	document.querySelector('#admit_student').addEventListener('click', AdmitStudent);
	document.querySelector('#new_student_pw_submit').addEventListener('click', changeStudentPassword);

	$(".manage-students-modal").on("hidden.bs.modal", clearManageStudentsModal);

	socket.on('Response_ChangeStudentPassword', handleResponseChangeStudentPassword);
	socket.on('Response_AdmitStudent', 	RequestStudents);
	socket.on('Response_RemoveStudent', RequestStudents);
	socket.on('Response_StudentsForClass', handleReponseGetStudents);
}

window.addEventListener("load", initManageStudentsModule);