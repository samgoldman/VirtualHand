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

function ClearAllHallPassRequests() {
	getSelectedClassIds().forEach((key) => {
		socket.emit('Request_TeacherResolveAllHallPassRequests', {cid: key});
	});
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

	if(numOut === 0 && requests.length > 0) {
		grantPass(requests[0]._id);
	}

	requests.forEach((request) => {
		const timeString = stopwatch_format(request.granted ? request.grantedTime : request.requestTime);
		const newItem = window.listItemTemplate({
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
	$('#clear-all-hp').click(ClearAllHallPassRequests);
});

setInterval(RetrieveHallPassRequests, 1000);