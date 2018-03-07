function ClassSelectorChanged() {
	sortClasses();
	UpdateAssistanceRequestStatus();
}

function getSelectedClassId() {
	let options = document.getElementById("class_selector").getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i].value;
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
	for (i = 0; i < tmpAry.length; i++) {
		let op = new Option(tmpAry[i][0], tmpAry[i][1]);
		op.selected = tmpAry[i][2];
		selElem.options[i] = op;
	}
}

window.addEventListener("load", function () {
	document.getElementById("class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
});