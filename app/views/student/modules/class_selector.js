function ClassSelectorChanged() {
	sortClasses();
}

function getSelectedClassId() {
	let options = document.getElementById("class_selector").getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i].value;
}

window.addEventListener("load", function () {
	document.getElementById("class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
});
