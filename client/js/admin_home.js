var socket = io.connect(io_host);

function createMessage() {
	socket.emit('CreateMessage', {
		name : document.getElementById('name').value,
		message : document.getElementById('message').value
	});
}

function getLogFiles() {
	socket.emit('GetLogFileNames', {});
}

if (!String.prototype.includes) {
	String.prototype.includes = function() {
		'use strict';
		return String.prototype.indexOf.apply(this, arguments) !== -1;
	};
}

socket.on('SendLogFileNames', function(data) {
	var files = data.list;
	for (var i = 0; i < files.length; i++) {
		if (files[i].includes('app-') || files[i].includes('debug-')) {
			var seconds = files[i].substring(files[i].indexOf("-") + 1, files[i].indexOf('.'));
			var date = new Date(Math.round(seconds));
			document.getElementById('logs').innerHTML += '<a href="/get_log?q=' + files[i] + '" >' + files[i].substring(0, files[i].indexOf('-')) + ': ' + date.toString() + '</a></br>';
		}
	}
});

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