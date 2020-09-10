// Unclear why this function just wraps sortClasses, but 'ClassSelectorChanged' is overloaded witha teacher version
function ClassSelectorChanged() { 
	sortClasses();
}

function getSelectedClassId() {
	const options = document.querySelector("#class_selector").querySelector("option").filter(option => option.selected);
	return options.length > 0 ? options[options.length - 1].value : undefined;
}

function ClassSelectorInit() {
	document.querySelector("#class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit);
