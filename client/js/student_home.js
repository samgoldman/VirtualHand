var socket = io.connect();

socket.on('HandRemoved', function(data) {
	var class_list = document.getElementById('class_selector'), classes = class_list.getElementsByTagName('option');

	for (var j = 0; j < classes.length; j++) {
		if (classes[j].value == data.hand_state) {
			class_list.remove(j);
		}
	}
});

socket.on('SendInitialHand', function(data) {
	if (data.id == document.getElementById("session_id").value) {
		if (data.hand_admitted) {
			if (data.hand_state) {
				document.getElementById("hand_status").innerHTML = "Your hand is: UP";
			} else {
				document.getElementById("hand_status").innerHTML = "Your hand is: DOWN";
			}
			document.getElementById("handchangebutton").disabled = false;
		} else {
			document.getElementById("handchangebutton").disabled = true;
			document.getElementById("hand_status").innerHTML = "You have not been admitted to the class you selected. Please talk to your teacher!";
		}
	}

});

socket.on('HandStateChange', function(data) {
	var select = document.getElementById('class_selector'), options = select.getElementsByTagName('option'), value;

	for (var i = options.length; i--;) {
		if (options[i].selected)
			value = options[i].value;
	}

	if (value == data.hand_state_id) {
		document.getElementById("handchangebutton").disabled = false;
		if (data.hand_state) {
			document.getElementById("hand_status").innerHTML = "Your hand is: UP";
		} else {
			document.getElementById("hand_status").innerHTML = "Your hand is: DOWN";
		}
	}
});

function getHand() {

	var select = document.getElementById('class_selector'), options = select.getElementsByTagName('option'), value;

	for (var i = options.length; i--;) {
		if (options[i].selected)
			value = options[i].value;
	}

	socket.emit('GetInitialHand', {
		id : document.getElementById("session_id").value,
		handstate_id : value
	});

}

function changeHand() {
	var select = document.getElementById('class_selector'), options = select.getElementsByTagName('option'), value;

	for (var i = options.length; i--;) {
		if (options[i].selected)
			value = options[i].value;
	}

	socket.emit('ChangeHand', {
		handstate_id : value
	});
}

var changePasswordActive = false;
var enrollExpanded = false;

function toggleChangePassword() {
	if (!changePasswordActive) {
		document.getElementById("div_changepass").style.display = "block";
		if (enrollExpanded) {
			document.getElementById("div_enroll").style.display = "none";
			enrollExpanded = false;
		}
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

function toggleEnroll() {
	if (!enrollExpanded) {
		document.getElementById("div_enroll").style.display = "block";
		if (changePasswordActive) {
			document.getElementById("div_changepass").style.display = "none";
			changePasswordActive = false;
		}
	} else {
		document.getElementById("div_enroll").style.display = "none";
	}
	enrollExpanded = !enrollExpanded;
}

socket.on('EnrollResponse', function(data) {
	if (data.id == document.getElementById("session_id").value) {
		if (data.message.indexOf("Success") > -1) {
			setTimeout(window.location.reload(), 10);
		} else {
			alert(data.message);
		}
	}
});

function enroll() {
	socket.emit("Enroll", {
		id : document.getElementById("session_id").value,
		user_id : document.getElementById("user_id").value,
		class_key : document.getElementById("class_key").value,
	});
}