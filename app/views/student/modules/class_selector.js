// Unclear why this function just wraps sortClasses, but 'ClassSelectorChanged' is overloaded witha teacher version
function ClassSelectorChanged() { 
	sortClasses();
}

function getSelectedClassId() {
	let options = document.querySelector("#class_selector").querySelector("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i].value;
}

function ClassSelectorInit() {
	document.querySelector("#class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit);
