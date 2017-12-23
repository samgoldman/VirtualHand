var socket = io.connect();

function createMessage() {
	socket.emit('CreateMessage', {
		name : document.getElementById('name').value,
		message : document.getElementById('message').value
	});
}

if (!String.prototype.includes) {
	String.prototype.includes = function() {
		'use strict';
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
}

function getUserCount() {
	socket.emit('GetLoggedInCount', {});
}

socket.on('LoggedInCount', function(data) {
	alert(data.count);
});


var changePasswordActive = false;
function toggleChangePassword() {
	if (!changePasswordActive) {
		document.getElementById("div_changepass").style.display = "block";
	} else {
		document.getElementById("div_changepass").style.display = "none";
	}
	changePasswordActive = !changePasswordActive;
}

socket.on('ChangePasswordResponse', function(data){
	alert(data.message);
});

function changePassword(){
	socket.emit("ChangePassword", {user_id : document.getElementById('user_id').value, oldPass : document.getElementById('oldPassword').value, newPass : document.getElementById('newPassword').value});
}