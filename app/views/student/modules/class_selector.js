function getSelectedClassId() {
	const option = document.querySelector("#class_selector").querySelector("option:checked");
	return undefined !== option ? option.value : undefined;
}

function ClassSelectorInit_Student() {
	document.querySelector("#class_selector").addEventListener('change', sortClasses);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit_Student);
