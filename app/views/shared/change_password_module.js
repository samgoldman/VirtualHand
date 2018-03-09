function ChangePassword() {
	let data = {
		oldPassword: document.getElementById('oldPassword').value,
		newPassword: document.getElementById('newPassword').value
	};
	socket.emit('Request_PasswordChange', data, ChangePasswordCallback);
}

function ChangePasswordCallback(data) {
	document.getElementById("change_password_alert_box").innerHTML = data.message;
	document.getElementById("change_password_alert_box").style.display = "block";
}

window.addEventListener("load", function () {
	document.getElementById("changePasswordSubmit").addEventListener('click', ChangePassword);

	$(".change-password-modal").on("hidden.bs.modal", function(){
		document.getElementById("change_password_alert_box").innerHTML = '';
		document.getElementById("change_password_alert_box").style.display = "none";
		$('#oldPassword').val('');
		$('#newPassword').val('');
	});
});