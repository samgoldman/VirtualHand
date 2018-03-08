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
	if (numSelected === 1) {
		$('.management_button').removeAttr("disabled");
	} else {
		$('.management_button').attr("disabled", "disabled");
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

function RenameClass(id, name) {
	let options = $('#class_selector')[0].getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].value === id) {
			options[i].innerHTML = name;
		}
	sortClasses();
	ClassSelectorChanged();
}

function sortClasses() {
	let selElem = document.getElementById("class_selector");
	let tmpAry = [];
	for (let i = 0; i < selElem.options.length; i++) {
		tmpAry[i] = [];
		tmpAry[i][0] = selElem.options[i].text;
		tmpAry[i][1] = selElem.options[i].value;
		tmpAry[i][2] = selElem.options[i].selected;
	}
	tmpAry.sort();
	while (selElem.options.length > 0) {
		selElem.options[0] = null;
	}
	for (let i = 0; i < tmpAry.length; i++) {
		let op = new Option(tmpAry[i][0], tmpAry[i][1]);
		op.selected = tmpAry[i][2];
		selElem.options[i] = op;
	}
}

window.addEventListener("load", function () {
	$('#class_selector').change(ClassSelectorChanged);
	sortClasses();
});