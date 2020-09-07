const ToggleAssistanceButton = () => {
	let button = document.getElementById("requestAssistanceButton");
	if (button.innerHTML === "Lower Hand") {
		socket.emit('Request_ResolveAssistanceRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Raise Hand") {
		socket.emit('Request_InitiateAssistanceRequest', {cid: getSelectedClassId()});
	}
}

const UpdateAssistanceRequestStatus = () => {
	$('#requestAssistanceButton').removeAttr("disabled");
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
	let button = document.getElementById("requestHallPassButton");
	if (button.innerHTML === "You are waiting for a hall pass. Click to withdraw your request.") {
		socket.emit('Request_StudentResolveHallPassRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Request a Hall Pass") {
		socket.emit('Request_InitiateHallPassRequest', {cid: getSelectedClassId()});
	}
}

const UpdateHallPassRequestStatus = () => {
	$('#requestHallPassButton').removeAttr("disabled");
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

		// delta in seconds
		let delta = Math.abs(Date.now() - new Date(data.request.grantedTime)) / 1000;

		let days = Math.floor(delta / 86400);
		delta -= days * 86400;
		let hours = Math.floor(delta / 3600) % 24;
		delta -= hours * 3600;
		let minutes = Math.floor(delta / 60) % 60;
		delta -= minutes * 60;
		let seconds = parseInt(delta % 60);

		let timeString = '';
		if(days>0) timeString+= days + ':';
		if(hours>0 || days>0) timeString+= ("0" + hours).slice(-2) + ':';
		timeString += ("0" + minutes).slice(-2) + ':' + ("0" + seconds).slice(-2);

		document.querySelector('#pass_timer').innerHTML = timeString;
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