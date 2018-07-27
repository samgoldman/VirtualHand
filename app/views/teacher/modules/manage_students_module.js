function StudentSelectorChanged() {
	let selectedStudentOption = getSelectedStudentOption();
	if (selectedStudentOption.className.indexOf('not-admitted') === -1) {
		$('#remove_student').removeAttr("disabled");
		$('#new_student_pw').removeAttr("disabled");
		$('#new_student_pw_submit').removeAttr("disabled");
		$('#admit_student').attr("disabled", "disabled");
	} else {
		$('#remove_student').removeAttr("disabled");
		$('#new_student_pw').attr("disabled", "disabled");
		$('#new_student_pw_submit').attr("disabled", "disabled");
		$('#admit_student').removeAttr("disabled");
	}
}

function RequestStudents() {
	socket.emit('Request_StudentsForClass', {
		cid: getSelectedClassId()
	});
}

function getSelectedStudentOption() {
	let options = $('#student_selector')[0].getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i];
}

socket.on('Response_StudentsForClass', function (data) {
	let enrollments = data.enrollments;
	let sSelect = document.getElementById("student_selector");
	sSelect.innerHTML = "";
	for (let i = 0; i < enrollments.length; i++) {
		let option = document.createElement("option");
		option.text = enrollments[i].student.username;
		option.value = enrollments[i].student._id;
		if (enrollments[i].admitted === false) {
			option.className += ' bg-info not-admitted ';
		}
		sSelect.add(option);
	}
});

function RemoveStudent() {
	socket.emit('Request_RemoveStudent', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value
	})
}

socket.on('Response_RemoveStudent', function () {
	RequestStudents();
});

function AdmitStudent() {
	socket.emit('Request_AdmitStudent', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value
	})
}

socket.on('Response_AdmitStudent', function () {
	RequestStudents();
});

function changeStudentPassword() {
	socket.emit('Request_ChangeStudentPassword', {
		cid: getSelectedClassId(),
		sid: getSelectedStudentOption().value,
		password: $('#new_student_pw').val()
	})
}

socket.on('Response_ChangeStudentPassword', function (data) {
	$('#manage_students_alert_box').text(data.message);
	document.getElementById('manage_students_alert_box').style.display = "block";
});

window.addEventListener("load", function () {
	$('#student_selector').change(StudentSelectorChanged);
	$('#manage_students_button').click(RequestStudents);
	$('#remove_student').click(RemoveStudent);
	$('#admit_student').click(AdmitStudent);
	$('#new_student_pw_submit').click(changeStudentPassword);

	$(".manage-students-modal").on("hidden.bs.modal", function(){
		$('#manage_students_alert_box').text('');
		document.getElementById('manage_students_alert_box').style.display = "none";
	});
});