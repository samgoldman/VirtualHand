function RenameClassClicked() {
	let name = document.getElementById('class_rename').value;
	socket.emit('Request_CourseRename', {
		cid: getSelectedClassId(),
		newCourseName: name
	});
}

socket.on('Response_CourseRename', function (data) {
	document.getElementById("rename_class_alert_box").innerHTML = data.message;
	document.getElementById("rename_class_alert_box").style.display = "block";
	if (data.success) {
		RenameClass(data.courseId, data.courseName);
	}
});

window.addEventListener("load", function () {
	$('#rename_class_submit').each(function () {
		this.addEventListener('click', RenameClassClicked);
	});

	$(".rename-class-modal").on("hidden.bs.modal", function(){
		$('#class_rename').val('');
		document.getElementById("rename_class_alert_box").innerHTML = "";
		document.getElementById("rename_class_alert_box").style.display = "none";
	});
});