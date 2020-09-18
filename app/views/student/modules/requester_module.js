const ToggleAssistanceButton = () => {
	const button = document.querySelector("#requestAssistanceButton");
	if (button.innerHTML === "Lower Hand") {
		socket.emit('Request_ResolveAssistanceRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Raise Hand") {
		socket.emit('Request_InitiateAssistanceRequest', {cid: getSelectedClassId()});
	}
}

const UpdateAssistanceRequestStatus = () => {
	document.querySelector('#requestAssistanceButton').removeAttribute("disabled");
	socket.emit('Request_AssistanceRequestStatus', {cid: getSelectedClassId()});
}

const ProcessAssistanceRequestStatus = data => {
	const button = document.querySelector('#requestAssistanceButton');
	if (data.status) {
		button.innerHTML = "Lower Hand";
		button.classList.add('btn-danger');
		button.classList.remove('btn-default', 'btn-success');
	} else {
		button.innerHTML = "Raise Hand";
		button.classList.add('btn-success');
		button.classList.remove('btn-default', 'btn-danger');
	}
}

const ToggleHallPassButton = () => {
	let button = document.querySelector("#requestHallPassButton");
	if (button.innerHTML === "You are waiting for a hall pass. Click to withdraw your request.") {
		socket.emit('Request_StudentResolveHallPassRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Request a Hall Pass") {
		socket.emit('Request_InitiateHallPassRequest', {cid: getSelectedClassId()});
	}
}

const UpdateHallPassRequestStatus = () => {
	document.querySelector('#requestHallPassButton').removeAttribute("disabled");
	socket.emit('Request_HallPassRequestStatus', {cid: getSelectedClassId()});
}

const ProcessHallPassRequestStatus = data => {
	const button = document.querySelector("#requestHallPassButton");
	if(!data.request) {
		button.innerHTML = "Request a Hall Pass";
		button.classList.add('btn-success');
		button.classList.remove('btn-default', 'btn-danger');

		$('#hall-pass-modal').modal('hide');
	} else if (!data.request.granted) {
		button.innerHTML = "You are waiting for a hall pass. Click to withdraw your request.";
		button.classList.add('btn-danger');
		button.classList.remove('btn-default', 'btn-success');

		$('#hall-pass-modal').modal('hide');
	} else {
		$('#hall-pass-modal').modal({backdrop: 'static', keyboard: false});

		document.querySelector('#pass_timer').innerHTML = stopwatch_format(data.request.grantedTime);
		setTimeout(UpdateHallPassRequestStatus, 1000);
	}
}

const ReturnHallPass = () => {
	socket.emit('Request_StudentResolveHallPassRequest', {cid: getSelectedClassId()});
}

const ding = () => {
	document.querySelector("#ding").play();
}

const RequesterModuleInit = () => {
	document.querySelector("#requestAssistanceButton").addEventListener('click', ToggleAssistanceButton);
	document.querySelector("#requestHallPassButton").addEventListener('click', ToggleHallPassButton);
	document.querySelector("#class_selector").addEventListener('change', UpdateAssistanceRequestStatus);
	document.querySelector("#class_selector").addEventListener('change', UpdateHallPassRequestStatus);
	document.querySelector("#return-pass-button").addEventListener('click', ReturnHallPass);

	socket.on('Response_HallPassRequestStatus', ProcessHallPassRequestStatus);
	socket.on('Broadcast_HallPassRequestModified', UpdateHallPassRequestStatus);
	socket.on('Response_AssistanceRequestStatus', ProcessAssistanceRequestStatus);
	socket.on('Broadcast_AssistanceRequestModified', UpdateAssistanceRequestStatus);

	$('#audioModule').hide();
	$('#hall-pass-modal').on('shown.bs.modal', ding);
};

window.addEventListener("load", RequesterModuleInit);