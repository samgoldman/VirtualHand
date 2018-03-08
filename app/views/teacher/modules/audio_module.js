$(document).ready(function() {
	$("#audioCheck").click(function() {
		let checkBoxes = $("#audioCheck");
		checkBoxes.prop("checked", !checkBoxes.prop("checked"));
	});
});