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