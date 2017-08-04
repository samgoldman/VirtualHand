var socket = io.connect(io_host);

socket.on('RecoverPasswordResponse', function(data) {
	alert(data.message);
});

function recoverPass() {
	socket.emit('RecoverPassword', {
		user_name : document.getElementById('username').value
	});
}