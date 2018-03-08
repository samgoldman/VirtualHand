socket.on('Broadcast_HallPassRequestModified', function () {
	RetrieveHallPassRequests();
});
function RetrieveHallPassRequests() {
	socket.emit('Request_RetrieveHallPassRequests', {cids: getSelectedClassIds()});
}

function resolvePass(hrid) {
	socket.emit('Request_TeacherResolveHallPassRequest', {hrid: hrid});
}

function grantPass(hrid) {
	socket.emit('Request_TeacherGrantHallPassRequest', {hrid: hrid});
}

socket.on('Response_RetrieveHallPassRequests', function (data) {
	let requests = data.requests;

	let outDiv = $('#out_of_room_div')[0];
	let waitingDiv = $('#waiting_for_pass_div')[0];

	outDiv.innerHTML = "";
	waitingDiv.innerHTML = "";

	let numOut = 0;

	requests.forEach((request) => {
		if(request.granted)
			numOut++;
	});

	if(numOut === 0) {
		grantPass(requests[0]._id);
	}

	requests.forEach((request) => {
		// delta in seconds
		let delta = Math.abs(Date.now() - new Date((request.granted?request.grantedTime:request.requestTime))) / 1000;

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

		let newItem = window.listItemTemplate({
			username: request.student.username,
			hrid: request._id,
			includeGrantButton: !request.granted,
			time: timeString});
		if(request.granted)
			outDiv.innerHTML += newItem;
		else
			waitingDiv.innerHTML += newItem;
	});
});
window.addEventListener("load", function () {
	$('#class_selector').change(RetrieveHallPassRequests);
});

setInterval(RetrieveHallPassRequests, 1000);