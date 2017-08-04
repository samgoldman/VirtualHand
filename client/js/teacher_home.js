//Connect to socket.io, using the io_host given by the server
var socket = io.connect(io_host);

// Call this when the server sends io packet 'SendHandsForClasses' (basically
// sending students for given class)
socket.on('SendHandsForClasses', function(data) {
	// Verify this data belongs to this session (old and unneccessary, I think)
	if (data.id == document.getElementById("session_id").value) {
		// Add the option element sent to the document (Should stop sending
		// options and build them here)
		document.getElementById("student_list").innerHTML += data.hand;
	}
	// Call to update the page
	updateDivs();
});

// Call this when the server sends io packet 'HandRemoved' (basically sending
// confirmation that a student was removed)
socket.on('HandRemoved', function(data) {
	var student_list = document //
	.getElementById('student_list'), students = student_list.getElementsByTagName('option');

	for (var j = 0; j < students.length; j++) {
		if (students[j].value == data.hand_state) {
			student_list.remove(j);
			updateDivs();
		}
	}
	updateDivs();
});

socket.on('HandStateChange', function(data) {
	var student_list = document.getElementById('student_list'), students = student_list.getElementsByTagName('option');
	var class_list = document.getElementById('class_selector'), classes = class_list.getElementsByTagName('option');

	for (var i = 0; i < classes.length; i++) {
		if (classes[i].value == data.class_id && classes[i].selected) {
			if (data.hand_state) {
				var option = document.createElement("option");
				option.text = data.username;
				option.value = data.hand_state_id;
				student_list.add(option);
				if (document.getElementById("audioCheck").checked) {
					var ding = document.getElementById("ding");

					ding.play();
				}
			} else {
				for (var j = 0; j < students.length; j++) {
					if (students[j].value == data.hand_state_id) {
						student_list.remove(j);
						updateDivs();
					}
				}
			}
		}
	}
	updateDivs();
});

function getHands() {

	var select = document.getElementById('class_selector'), options = select.getElementsByTagName('option'), values = [];

	document.getElementById('student_list').innerHTML = "";
	updateDivs();

	for (var i = options.length; i--;) {
		if (options[i].selected)
			values.splice(-1, 0, options[i].value);
	}

	socket.emit("GetHandsForClasses", {
		id : document.getElementById("session_id").value,
		classes : values,
		user_id : document.getElementById("user_id").value
	});
}

function updateDivs() {
	var options = document.getElementById('student_list').getElementsByTagName('option');
	var i = 5;
	if (options.length < 5) {
		i = options.length;
	}
	for (var j = 0; j < i; j++) {
		var l = "listItem" + j;
		document.getElementById(l).innerHTML = options[j].text;
	}

	for (var j = i; j < 5; j++) {
		var l = "listItem" + j;
		document.getElementById(l).innerHTML = "";
	}
}

function putDownHand() {
	var select = document.getElementById('student_list'), options = select.getElementsByTagName('option'), value;

	for (var i = options.length; i--;) {
		if (options[i].selected) {
			socket.emit('ChangeHand', {
				handstate_id : options[i].value
			});
			updateDivs();
		}
	}
}

function handDown(h) {
	document.getElementById('student_list').selectedIndex = h;
	putDownHand();
}

function KeyPress(e) {

	var keynum;

	if (window.event) { // IE
		keynum = e.keyCode;
	} else if (e.which) { // Netscape/Firefox/Opera
		keynum = e.which;
	}
	var key = String.fromCharCode(keynum);
	if (key == '1') {
		handDown(0);
	} else if (key == '2') {
		handDown(1);
	} else if (key == '3') {
		handDown(2);
	} else if (key == '4') {
		handDown(3);
	} else if (key == '5') {
		handDown(4);
	}
}

var changePasswordActive = false;
function toggleChangePassword() {
	if (!changePasswordActive) {
		document.getElementById("div_changepass").style.display = "block";
	} else {
		document.getElementById("div_changepass").style.display = "none";
	}
	changePasswordActive = !changePasswordActive;
}

socket.on('ChangePasswordResponse', function(data) {
	alert(data.message);
});

function changePassword() {
	socket.emit("ChangePassword", {
		user_id : document.getElementById('user_id').value,
		oldPass : document.getElementById('oldPassword').value,
		newPass : document.getElementById('newPassword').value
	});
}

socket.on('CreateClassResponse', function(data) {
	document.getElementById("create_class_alert_box").innerHTML = data.message;
	document.getElementById("create_class_alert_box").style.display = "block";
	if (data.message.indexOf("success") > -1) {
		setTimeout(function() {
			window.location.reload()
		}, 500);
	}
});

function createClass() {
	socket.emit('CreateClass', {
		user_id : document.getElementById('user_id').value,
		classname : document.getElementById('classname').value
	});
}

var createClassActive = false;
function toggleCreateClass() {
	if (!createClassActive) {
		document.getElementById("div_create_class").style.display = "block";
	} else {
		document.getElementById("div_create_class").style.display = "none";
	}
	createClassActive = !createClassActive;
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

setTimeout(function() {
	sortClasses();
}, 1);

// ====================================================
// == Student & Class Management Code =================
// ====================================================
socket.on('SendAdmittedHand', function(data) {
	if (data.id == document.getElementById("session_id").value) {
		document.getElementById("student_list_manage").innerHTML += data.hand;
		if (document.getElementById("student_list_manage").length > 1) {
			sortList();
		}
	}
});

socket.on('HandRemoved', function(data) {
	var student_list = document.getElementById('student_list_manage'), students = student_list.getElementsByTagName('option');

	for (var j = 0; j < students.length; j++) {
		if (students[j].value == data.hand_state) {
			student_list.remove(j);
		}
	}
});

function removeStudent() {
	var select = document.getElementById('student_list_manage'), options = select.getElementsByTagName('option');

	for (var i = options.length; i--;) {
		if (options[i].selected) {
			var value = options[i].value;
			socket.emit('RemoveStudent', {
				hand_state_id : value
			});
		}
	}
}

function rejectStudent() {
	for (var i = options.length; i--;) {
		if (options[i].selected) {
			var value = options[i].value;
			socket.emit('RemoveStudent', {
				hand_state_id : value
			});
		}
	}
}

function getAllHands() {

	var select = document.getElementById('class_selector_manage'), options = select.getElementsByTagName('option'), values = [];

	for (var i = options.length; i--;) {
		if (options[i].selected)
			values.splice(-1, 0, options[i].value);
	}

	if (values.length != 0) {
		document.getElementById('navbar').style.display = 'block';
	}

	document.getElementById("student_list_manage").innerHTML = "";

	socket.emit('GetClassKey', {
		class_id : values[0]
	});

	socket.emit("GetAllHandsForClasses", {
		id : document.getElementById("session_id").value,
		classes : values,
		user_id : document.getElementById("user_id").value
	});

	document.getElementById("newkey").value = "";
	document.getElementById("defaultpassword").value = "";
	document.getElementById("csv").value = "";
	document.getElementById("newClassName").value = "";
	document.getElementById("enrollAlert").innerHTML = "";

}

socket.on('SendClassKey', function(data) {
	document.getElementById('cKey').innerHTML = 'Current Class Key: <strong>' + data.key + '</strong>';
});

socket.on('HandStateChange', function(data) {
	var student_list = document.getElementById('student_list_manage'), students = student_list.getElementsByTagName('option');
	var class_list = document.getElementById('class_selector_manage'), classes = class_list.getElementsByTagName('option');

	for (var i = 0; i < classes.length; i++) {
		if (classes[i].value == data.class_id) {
			if (data.hand_admitted) {
				var contains = false;
				for (var j = 0; j < students.length; j++) {
					if (students[j].value == data.hand_state_id) {
						contains = true;
					}
				}
				if (!contains) {
					var option = document.createElement("option");
					option.text = data.username;
					option.value = data.hand_state_id;
					student_list.add(option);
				}
			} else {
				for (var j = 0; j < students.length; j++) {
					if (students[j].value == data.hand_state_id) {
						student_list.remove(j);
					}
				}
				var option = document.createElement("option");
				option.text = data.username;

				option.value = data.hand_state_id;
				student_list.add(option);
			}
		}
	}
});

function renameClass() {
	var select = document.getElementById('class_selector_manage'), options = select.getElementsByTagName('option'), value = null;

	for (var i = options.length; i--;) {
		if (options[i].selected) {
			value = options[i].value;
		}
	}
	socket.emit("ChangeClassName", {
		class_id : value,
		new_classname : document.getElementById('newClassName').value,
		user_id : document.getElementById("user_id").value
	})
}

socket.on('ChangeClassNameResponse', function(data) {
	alert(data.message);
});

function activate(num) {
	var i = 0;
	for (i = 0; i < 4; i++) {
		if (i == num) {
			document.getElementById("nav_" + i).className = "active";
			document.getElementById("div_" + i).style.display = "block";
		} else {
			document.getElementById("nav_" + i).className = "";
			document.getElementById("div_" + i).style.display = "none";
		}
	}
}

socket.on('ChangeClassKeyResponse', function(data) {
	if (!data.success) {
		document.getElementById('changeKeyAlert').style.display = 'block';
		document.getElementById('changeKeyAlert').innerHTML += '<br/> That class key is already taken. Please select another.';
	} else {
		document.getElementById('changeKeyAlert').style.display = 'block';
		document.getElementById('changeKeyAlert').innerHTML += '<br/> The class key has been changed successfully. Please refresh the page.';
	}
	getAllHands();
});

function changeKey() {
	socket.emit('ChangeClassKey', {
		class_id : document.getElementById('class_selector_manage').value,
		newkey : document.getElementById('newkey').value,
	});
}

function processStudents2() {
	if (document.getElementById('class_selector_manage').value == "" || document.getElementById('class_selector_manage').value == null) {
		document.getElementById('enrollAlert').innerHTML += "Please select a class before continuing.</br>";
	} else if (document.getElementById('defaultpassword').value == null) {
		document.getElementById('enrollAlert').innerHTML += " Please select a default password before continuing.</br>";
	} else {
		var students = document.getElementById("csv").value.split(",");
		var num = students.length;
		for (var i = 0; i < num; i++) {
			if (students[i] == "") {
				continue;
			}
			setTimeout(emitCreate, i * 1000, students[i], document.getElementById('class_selector_manage').value, document.getElementById('user_id').value, document.getElementById('defaultpassword').value, document
					.getElementById('user_school').value);
		}
	}
}

function emitCreate(sn, cid, uid, pwd, sch) {
	console.log(Date.now());
	socket.emit('TeacherCreateStudent', {
		student_name : sn,
		class_id : cid,
		user_id : uid,
		password : pwd,
		school : sch
	});
}

socket.on('TeacherEnrollStudentResponse', function(data) {
	document.getElementById('enrollAlert').innerHTML += data.message + "</br>";
});
socket.on('TeacherCreateStudentResponse', function(data) {
	document.getElementById('enrollAlert').innerHTML += data.message + "</br>";
});

function sortList() {
	var list = document.getElementById("student_list_manage");
	var listTexts = new Array();

	for (i = 0; i < list.length; i++) {
		listTexts[i] = list.options[i].text + "," + list.options[i].text + "," + list.options[i].value + "," + list.options[i].selected;
	}

	listTexts.sort();

	for (i = 0; i < list.length; i++) {
		var parts = listTexts[i].split(',');

		list.options[i].text = parts[1];
		list.options[i].value = parts[2];
		list.options[i].selected = (parts[3] == "true");
	}
}
function submitChangePass() {
	console.log(document.getElementById("student_list_manage").options[document.getElementById("student_list_manage").selectedIndex].value);
	socket.emit('ChangeStudentPassword', {
		user_id : document.getElementById('user_id').value,
		student_id : document.getElementById("student_list_manage").options[document.getElementById("student_list_manage").selectedIndex].value,
		new_password : document.getElementById("new_pass").value
	});
}
socket.on('ChangeStudentPasswordResponse', function(data) {
	alert(data.message);
});