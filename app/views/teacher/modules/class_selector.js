// This will enable the 4 management buttons iff there is a single
// class selected
function UpdateManagementButtons() {
	const numSelected = document.querySelectorAll('#class_selector option:checked').length;

	const managementButtons = document.querySelectorAll('.management_button');

	if (numSelected === 1) {
		managementButtons.forEach(button => {
			button.removeAttribute('disabled');
			button.classList.remove('disabled');
		});
		const selected = getSelectedClassId();
		document.querySelector('#ar_history_link').setAttribute('href', `/teacher/history/assistancerequest/${selected}`);
		document.querySelector('#hp_history_link').setAttribute('href', `/teacher/history/hallpass/${selected}`);
	} else {
		managementButtons.forEach(button => {
			button.setAttribute('disabled', 'disabled');
			button.classList.add('disabled');
		});
		document.querySelector('#ar_history_link').setAttribute('href', 'javascript:;');
		document.querySelector('#hp_history_link').setAttribute('href', 'javascript:;');
	}
}

function getSelectedClassIds() {
	return Array.prototype.slice.call(document.querySelectorAll('#class_selector option:checked')).map(option => option.value);
}

function AddClass(id, name) {
	const option = new Option(name, id);
	document.querySelector('#class_selector').appendChild(option);
	sortClasses();
}

function RemoveClass(id) {
	const option = document.querySelector(`option[value=${id}]`);
	document.querySelector('#class_selector').removeChild(option);
}

function RenameClass(id, name) {
	document.querySelector(`option[value=${id}]`).innerHTML = name;
	sortClasses();
	UpdateManagementButtons();
}

function ClassSelectorInit_Teacher() {
	document.querySelector('#class_selector').addEventListener('change', UpdateManagementButtons);
	sortClasses();
}

window.addEventListener("load", ClassSelectorInit_Teacher);
