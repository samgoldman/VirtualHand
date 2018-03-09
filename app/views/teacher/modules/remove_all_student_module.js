let remove_all_classname;

function RemoveAllConfirmClassname() {
	if(remove_all_classname === $('#remove_all_class_confirm').val()) {
		$('#remove_all_students_submit').removeAttr('disabled');
	} else {
		$('#remove_all_students_submit').attr('disabled', 'disabled');
	}
}

function RemoveAllStudents() {
	socket.emit('Request_RemoveAllStudents', {cid: getSelectedClassId()});
}

socket.on('Response_RemoveAllStudents', function (data) {
	document.getElementById("remove_all_students_alert_box").innerHTML = data.message;
	document.getElementById("remove_all_students_alert_box").style.display = "block";
});

window.addEventListener("load", function () {
	$('#remove_all_students_button').click(() => {
		remove_all_classname = $('#class_selector').find(":selected").text();
		$('#remove_all_students_classname').text(remove_all_classname);
	});

	$('#remove_all_class_confirm').on('keyup', RemoveAllConfirmClassname);
	$('#remove_all_students_submit').click(RemoveAllStudents);
});