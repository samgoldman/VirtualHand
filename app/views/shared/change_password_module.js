const ChangePassword = () => {
	const data = {
		oldPassword: document.querySelector("#old_password").value,
		newPassword: document.querySelector("#new_password").value
	};
	socket.emit('Request_PasswordChange', data, ChangePasswordCallback);
}

const ChangePasswordCallback = data => {
	const change_password_alert_box = document.querySelector("#change_password_alert_box");
	change_password_alert_box.innerHTML = data.message;
	change_password_alert_box.style.display = "block";
}

const ClearChangePasswordModal = () => {
	const change_password_alert_box = document.querySelector("#change_password_alert_box");
	const new_password = document.querySelector('#new_password');
	const old_password = document.querySelector('#old_password');

	change_password_alert_box.innerHTML = '';
	change_password_alert_box.style.display = "none";

	new_password.value = '';
	old_password.value = '';
};

const ChangePasswordModuleInit = () => {
	document.querySelector("#changePasswordSubmit").addEventListener("click", ChangePassword);
	$(".change-password-modal").on("hidden.bs.modal", ClearChangePasswordModal);
}

window.addEventListener("load", ChangePasswordModuleInit);