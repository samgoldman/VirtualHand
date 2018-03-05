function ClassSelectorChanged() {
	var options = $('#class_selector')[0].getElementsByTagName("option");
	UpdateManagementButtons(options);
}

// This will enable the 4 management buttons iff there is a single
// class selected
function UpdateManagementButtons(options) {
	var numSelected = 0;
	for (var i = options.length; i--;) {
		if(options[i].selected) {
			numSelected ++;
		}
	}
	console.log(numSelected);
	if (numSelected === 1) {
		$('.management_button').removeAttr("disabled");
	} else {
		$('.management_button').attr("disabled", "disabled");
	}
}

function AddClass(id, name) {
	var option = document.createElement("option");
	option.value = id;
	option.innerHTML = name;
	$('#class_selector')[0].add(option);
	sortClasses();
}

function sortClasses() {
	var options = $('select#class_selector option');
	var arr = options.map(function(_, o) {
		return {
			t : $(o).text(),
			v : o.value
		};
	}).get();
	arr.sort(function(o1, o2) {
		return o1.t > o2.t ? 1 : o1.t < o2.t ? -1 : 0;
	});
	options.each(function(i, o) {
		o.value = arr[i].v;
		$(o).text(arr[i].t);
	});
}

window.addEventListener("load", function(){
	$('#class_selector').change(ClassSelectorChanged);
	sortClasses();
});