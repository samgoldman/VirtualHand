function ToggleAssistanceButton() {
	console.log(document.getElementById("requestAssistanceButton").innerHTML);
	if (document.getElementById("requestAssistanceButton").innerHTML === "Lower Hand") {
		socket.emit('Request_ResolveAssistanceRequest', {
			uid: document.getElementById('user_id').value,
			cid: getSelectedClassId()
		});
	} else if (document.getElementById("requestAssistanceButton").innerHTML === "Raise Hand") {
		socket.emit('Request_InitiateAssistanceRequest', {
			uid: document.getElementById('user_id').value,
			cid: getSelectedClassId()
		});
	}
}

function UpdateAssistanceRequestStatus() {
	$('#requestAssistanceButton').removeAttr("disabled");
	socket.emit('Request_AssistanceRequestStatus',
		{
			uid: document.getElementById('user_id').value,
			cid: getSelectedClassId()
		});
}

socket.on('Broadcast_AssistanceRequestModified', function () {
	UpdateAssistanceRequestStatus();
});

socket.on('Response_AssistanceRequestStatus', function (data) {
	if (data.status) {
		document.getElementById("requestAssistanceButton").innerHTML = "Lower Hand";
		document.getElementById("requestAssistanceButton").classList.add('btn-danger');

		document.getElementById("requestAssistanceButton").classList.remove('btn-default');
		document.getElementById("requestAssistanceButton").classList.remove('btn-success');
	} else {
		document.getElementById("requestAssistanceButton").innerHTML = "Raise Hand";
		document.getElementById("requestAssistanceButton").classList.add('btn-success');

		document.getElementById("requestAssistanceButton").classList.remove('btn-default');
		document.getElementById("requestAssistanceButton").classList.remove('btn-danger');
	}
});

window.addEventListener("load", function () {
	document.getElementById("requestAssistanceButton").addEventListener('click', ToggleAssistanceButton);
});