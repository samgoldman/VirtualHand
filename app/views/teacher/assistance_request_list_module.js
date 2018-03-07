let numRequests = 0;

socket.on('Broadcast_AssistanceRequestModified', function () {
	RetrieveAssistanceRequests();
});

socket.on('Response_RetrieveAssistanceRequests', function (data) {
	let requests = data.requests;

	if (requests.length > numRequests) {
		// if (document.getElementById("audioCheck").checked) {
		// 	var ding = document.getElementById("ding");
		// 	ding.play();
		// }
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