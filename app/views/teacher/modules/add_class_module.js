function NewClassClicked() {
	$('#new_class_name').each(function () {
		let name = this.value;

		socket.emit('Request_CourseCreate', {
			courseName: name
		});
	});
}

socket.on('Response_CourseCreate', function (data) {
	document.getElementById("create_class_alert_box").innerHTML = data.message;
	document.getElementById("create_class_alert_box").style.display = "block";
	if (data.message.indexOf("success") > -1) {
		AddClass(data.courseId, data.courseName);
	}
});

window.addEventListener("load", function () {
	$('#new_class_submit').each(function () {
		this.addEventListener('click', NewClassClicked);
	});

	$(".create-class-modal").on("hidden.bs.modal", function(){
		$('#new_class_name').val('');
		document.getElementById("create_class_alert_box").innerHTML = "";
		document.getElementById("create_class_alert_box").style.display = "none";
	});
});