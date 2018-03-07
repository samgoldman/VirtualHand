function ChangePasswordClicked() {
	socket.emit('Request_PasswordChange', {
		uid : document.getElementById('user_id').value,
		oldPassword : document.getElementById('oldPassword').value,
		newPassword : document.getElementById('newPassword').value
	});
}

socket.on('Response_PasswordChange', function(data) {
	document.getElementById("change_password_alert_box").innerHTML = data.message;
	document.getElementById("change_password_alert_box").style.display = "block";
});

window.addEventListener("load", function(){
	document.getElementById("changePasswordSubmit").addEventListener('click', ChangePasswordClicked);
});