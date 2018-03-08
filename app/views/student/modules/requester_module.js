function ToggleAssistanceButton() {
	let button = document.getElementById("requestAssistanceButton");
	if (button.innerHTML === "Lower Hand") {
		socket.emit('Request_ResolveAssistanceRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Raise Hand") {
		socket.emit('Request_InitiateAssistanceRequest', {cid: getSelectedClassId()});
	}
}

function UpdateAssistanceRequestStatus() {
	$('#requestAssistanceButton').removeAttr("disabled");
	socket.emit('Request_AssistanceRequestStatus', {cid: getSelectedClassId()});
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



function ToggleHallPassButton() {
	let button = document.getElementById("requestHallPassButton");
	if (button.innerHTML === "You are waiting for a hall pass. Click to withdraw your request.") {
		socket.emit('Request_StudentResolveHallPassRequest', {cid: getSelectedClassId()});
	} else if (button.innerHTML === "Request a Hall Pass") {
		socket.emit('Request_InitiateHallPassRequest', {cid: getSelectedClassId()});
	}
}

function UpdateHallPassRequestStatus() {
	$('#requestHallPassButton').removeAttr("disabled");
	socket.emit('Request_HallPassRequestStatus', {cid: getSelectedClassId()});
}

socket.on('Broadcast_HallPassRequestModified', function () {
	UpdateHallPassRequestStatus();
});

socket.on('Response_HallPassRequestStatus', function (data) {
	if(!data.request) {
		document.getElementById("requestHallPassButton").innerHTML = "Request a Hall Pass";
		document.getElementById("requestHallPassButton").classList.add('btn-success');

		document.getElementById("requestHallPassButton").classList.remove('btn-default');
		document.getElementById("requestHallPassButton").classList.remove('btn-danger');
		$('#hall-pass-modal').modal('hide');
	} else if (!data.request.granted) {
		document.getElementById("requestHallPassButton").innerHTML = "You are waiting for a hall pass. Click to withdraw your request.";
		document.getElementById("requestHallPassButton").classList.add('btn-danger');

		document.getElementById("requestHallPassButton").classList.remove('btn-default');
		document.getElementById("requestHallPassButton").classList.remove('btn-success');
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
		if(hours>0) timeString+= hours + ':';
		timeString += ("0" + minutes).slice(-2) + ':' + ("0" + seconds).slice(-2);

		$('#pass_timer')[0].innerHTML = timeString;
		setTimeout(UpdateHallPassRequestStatus, 1000);
	}
});

function ReturnHallPass() {
	socket.emit('Request_StudentResolveHallPassRequest', {cid: getSelectedClassId()});
}

window.addEventListener("load", function () {
	document.getElementById("requestAssistanceButton").addEventListener('click', ToggleAssistanceButton);
	document.getElementById("requestHallPassButton").addEventListener('click', ToggleHallPassButton);
	document.getElementById("class_selector").addEventListener('change', UpdateAssistanceRequestStatus);
	document.getElementById("class_selector").addEventListener('change', UpdateHallPassRequestStatus);
	document.getElementById("return-pass-button").addEventListener('click', ReturnHallPass);
});