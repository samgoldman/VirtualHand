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
	getSelectedClassIds().forEach(key => {
		socket.emit('Request_TeacherResolveAllHallPassRequests', {cid: key});
	});
}

function clearHallPassDivs() {
	document.querySelector('#out_of_room_div').innerHTML = '';
	document.querySelector('#waiting_for_pass_div').innerHTML = '';
}

function countGranted(requests){
	return requests.reduce((total, request) => total + (request.granted ? 1 : 0), 0);
}

function handleResponseRetrieveHallPassRequests(data) {
	clearHallPassDivs();

	const numOut = countGranted(data.requests);

	if(numOut === 0 && data.requests.length > 0) {
		grantPass(data.requests[0]._id);
	}

	data.requests.forEach((request) => {
		const timeString = stopwatch_format(request.granted ? request.grantedTime : request.requestTime);
		const newItem = window.listItemTemplate({
			username: request.student.username,
			hrid: request._id,
			includeGrantButton: !request.granted,
			time: timeString});
		if(request.granted)
			document.querySelector('#out_of_room_div').innerHTML += newItem;
		else
			document.querySelecotr('#waiting_for_pass_div').innerHTML += newItem;
	});
}

function initHallPassModule() {
	socket.on('Broadcast_HallPassRequestModified', RetrieveHallPassRequests);
	socket.on('Response_RetrieveHallPassRequests', handleResponseRetrieveHallPassRequests);
	document.querySelector('#class_selector').addEventListener('change', RetrieveHallPassRequests);
	document.querySelector('#clear-all-hp').addEventListener('click', ClearAllHallPassRequests);

	setInterval(RetrieveHallPassRequests, 1000);
}

window.addEventListener("load", initHallPassModule);
