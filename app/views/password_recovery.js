const recoverPassCallback = (data) => {
	alert(data.message);
}

const recoverPass = () => {
	const data = {
		user_name : document.querySelector('#username').value
	};
	socket.emit('Request_RecoverPassword', data, recoverPassCallback);
}