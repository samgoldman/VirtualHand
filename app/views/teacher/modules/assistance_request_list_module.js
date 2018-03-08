let numRequests = 0;

socket.on('Broadcast_AssistanceRequestModified', function () {
	RetrieveAssistanceRequests();
});

socket.on('Response_RetrieveAssistanceRequests', function (data) {
	let requests = data.requests;

	if (requests.length > numRequests) {
		if (document.getElementById("audioCheck").checked) {
			let ding = document.getElementById("ding");
			ding.play();
		}
	}

	numRequests = requests.length;

	for (let i = 0; i < 5; i++) {
		let id = "listItem" + i;
		let listItem = document.getElementById(id);
		if (i >= requests.length) {
			listItem.innerHTML = "";
			listItem.setAttribute('value', "");
		} else {
			listItem.innerHTML = requests[i].student.username;
			listItem.setAttribute('value', requests[i]._id);
		}
	}
});

function handDown(index) {
	let id = "listItem" + index;
	let listItem = document.getElementById(id);
	if (listItem.getAttribute('value') !== "")
		socket.emit('Request_TeacherResolveAssistanceRequest', {arid: listItem.getAttribute('value')});
}

function RetrieveAssistanceRequests() {
	socket.emit('Request_RetrieveAssistanceRequests', {cids: getSelectedClassIds(), qty: 5});
}

function KeyDownHandler(e) {
	let keynum;

	if (window.event) { // IE
		keynum = e.keyCode;
	} else if (e.which) { // Netscape/Firefox/Opera
		keynum = e.which;
	}
	let key = String.fromCharCode(keynum);
	if (key === '1') {
		handDown(0);
	} else if (key === '2') {
		handDown(1);
	} else if (key === '3') {
		handDown(2);
	} else if (key === '4') {
		handDown(3);
	} else if (key === '5') {
		handDown(4);
	} else if (key === 'r') {
		RequestRandomStudent(getSelectedClassId());
	}
}

window.addEventListener("load", function () {
	document.body.addEventListener('keyup', KeyDownHandler);
});