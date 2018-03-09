let delete_course_classname;

function DeleteCourseConfirmClassname() {
	if(delete_course_classname === $('#delete_class_confirm').val()) {
		$('#delete_class_submit').removeAttr('disabled');
	} else {
		$('#delete_class_submit').attr('disabled', 'disabled');
	}
}

function DeleteCourse() {
	socket.emit('Request_DeleteCourse', {cid: getSelectedClassId()});
}

socket.on('Response_DeleteCourse', function (data) {
	document.getElementById("delete_class_alert_box").innerHTML = data.message;
	document.getElementById("delete_class_alert_box").style.display = "block";
	RemoveClass(getSelectedClassId());
	$('#delete_class_confirm').val('');
});

window.addEventListener("load", function () {
	$('#delete_class_button').click(() => {
		delete_course_classname = $('#class_selector').find(":selected").text();
		$('#delete_class_classname').text(delete_course_classname);
	});

	$('#delete_class_confirm').on('keyup', DeleteCourseConfirmClassname);
	$('#delete_class_submit').click(DeleteCourse);

	$(".delete-class-modal").on("hidden.bs.modal", function(){
		document.getElementById("delete_class_alert_box").innerHTML = '';
		document.getElementById("delete_class_alert_box").style.display = "none";
	});
});