socket.on('Response_RecoverPassword', function(data) {
	alert(data.message);
});

function recoverPass() {
	socket.emit('Request_RecoverPassword', {
		user_name : document.getElementById('username').value
	});
}