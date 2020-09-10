// Unclear why this function just wraps sortClasses, but 'ClassSelectorChanged' is overloaded witha teacher version
const ClassSelectorChanged = () => sortClasses();

const getSelectedClassId = () => {
	let options = document.getElementById("class_selector").getElementsByTagName("option");
	for (let i = options.length; i--;)
		if (options[i].selected)
			return options[i].value;
};

const ClassSelectorInit = () => {
	document.getElementById("class_selector").addEventListener('change', ClassSelectorChanged);
	sortClasses();
};

window.addEventListener("load", ClassSelectorInit);
