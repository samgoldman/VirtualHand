function ClassSelectorChanged() {
	let options = $('#class_selector')[0].getElementsByTagName("option");
	UpdateManagementButtons(options);
}

// This will enable the 4 management buttons iff there is a single
// class selected
function UpdateManagementButtons(options) {
	let numSelected = 0;
	for (let i = options.length; i--;) {
		if (options[i].selected) {
			numSelected++;
		}
	}

	const managementButtons = $('.management_button');

	if (numSelected === 1) {
		managementButtons.removeAttr("disabled");
		managementButtons.removeClass("disabled");
		$('#ar_history_link').attr('href', '/teacher/history/assistancerequest/' + getSelectedClassId());
		$('#hp_history_link').attr('href', '/teacher/history/hallpass/' + getSelectedClassId());
	} else {
		managementButtons.attr("disabled", "disabled");
		managementButtons.addClass("disabled");
		$('#ar_history_link').attr('href', 'javascript:;');
		$('#hp_history_link').attr('href', 'javascript:;');
	}
}

function getSelectedClassId() {
	let options = $('#class_selector')[0].getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i].value;
}

function getSelectedClassIds() {
	let ids = [];
	let options = $('#class_selector')[0].getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			ids.push(options[i].value);
	return ids;
}

function AddClass(id, name) {
	let option = document.createElement("option");
	option.value = id;
	option.innerHTML = name;
	$('#class_selector')[0].add(option);
	sortClasses();
}

function RemoveClass(id) {
	$('#class_selector option[value=' + id + ']').remove();
}

function RenameClass(id, name) {
	let options = $('#class_selector')[0].getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].value === id) {
			options[i].innerHTML = name;
		}
	sortClasses();
	ClassSelectorChanged();
}

window.addEventListener("load", function () {
	$('#class_selector').change(ClassSelectorChanged);

	sortClasses();
});
