// Unclear why this function just wraps sortClasses, but 'ClassSelectorChanged' is overloaded witha teacher version
function ClassSelectorChanged() { 
	sortClasses();
}

function getSelectedClassId() {
	const option = document.querySelector("#class_selector").querySelector("option:checked");
	return undefined !== option ? option.value : undefined;
}

function ClassSelectorInit() {
	document.querySelector("#class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit);
