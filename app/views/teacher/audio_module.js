$(document).ready(function() {
	$("#audioCheck").click(function() {
		var checkBoxes = $("#audioCheck");
		checkBoxes.prop("checked", !checkBoxes.prop("checked"));
	});
});