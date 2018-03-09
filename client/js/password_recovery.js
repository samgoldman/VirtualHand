function recoverPassCallback(data) {
	alert(data.message);
}

function recoverPass() {
	let data = {
		user_name : document.getElementById('username').value
	};
	socket.emit('Request_RecoverPassword', data, recoverPassCallback);
}