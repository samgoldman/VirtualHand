function ClassSelectorInit_Student() {
	document.querySelector("#class_selector").addEventListener('change', sortClasses);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit_Student);
