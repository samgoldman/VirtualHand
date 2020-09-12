let numRequests = 0;

const HandleRetrieveAssistanceRequests = data => {
	let requests = data.requests;

	if (requests.length > numRequests) {
		if (document.querySelector("#audioCheck").checked) {
			document.querySelector("#ding").play();
		}
	}

	numRequests = requests.length;

	for (let i = 0; i < 5; i++) {
		let listItem = document.querySelector(`#listItem${i}`);
		if (i >= requests.length) {
			listItem.innerHTML = "";
			listItem.setAttribute('value', "");
		} else {
			listItem.innerHTML = requests[i].student.username;
			listItem.setAttribute('value', requests[i]._id);
		}
	}
}

const handDown = index => {
	const listItem = document.querySelector(`#listItem${index}`);
	if (listItem.getAttribute('value') !== "")
		socket.emit('Request_TeacherResolveAssistanceRequest', {arid: listItem.getAttribute('value')});
}

function RetrieveAssistanceRequests() {
	socket.emit('Request_RetrieveAssistanceRequests', {cids: getSelectedClassIds(), qty: 5});
}

const ClearAllAssistanceRequests = () => {
	getSelectedClassIds().forEach((key) => {
		socket.emit('Request_TeacherResolveAllAssistanceRequests', {cid: key});
	});
}

const KeyDownHandler = (e) => {
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

const AssistanceRequestListModuleInit = () => {
	document.body.addEventListener('keyup', KeyDownHandler);
	socket.on('Broadcast_AssistanceRequestModified', RetrieveAssistanceRequests);
	socket.on('Response_RetrieveAssistanceRequests', HandleRetrieveAssistanceRequests);

	$('#class_selector').change(RetrieveAssistanceRequests);
	$('#clear-all-ar').click(ClearAllAssistanceRequests);
	RetrieveAssistanceRequests();
};

window.addEventListener("load", AssistanceRequestListModuleInit);