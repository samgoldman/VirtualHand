function ChangePassword() {
	socket.emit('Request_PasswordChange', {
		oldPassword: document.querySelector("#old_password").value,
		newPassword: document.querySelector("#new_password").value
	}, ChangePasswordCallback);
}

function ChangePasswordCallback(data) {
	const change_password_alert_box = document.querySelector("#change_password_alert_box");
	change_password_alert_box.innerHTML = data.message;
	change_password_alert_box.style.display = "block";
}

function ClearChangePasswordModal() {
	const change_password_alert_box = document.querySelector("#change_password_alert_box");
	change_password_alert_box.innerHTML = '';
	change_password_alert_box.style.display = "none";

	document.querySelector('#new_password').value = '';
	document.querySelector('#old_password').value = '';
}

function ChangePasswordModuleInit() {
	document.querySelector("#changePasswordSubmit").addEventListener("click", ChangePassword);
	$(".change-password-modal").on("hidden.bs.modal", ClearChangePasswordModal);
}

window.addEventListener("load", ChangePasswordModuleInit);