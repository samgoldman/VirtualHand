const AssistanceRequest = require('../models/assistanceRequest').model;
const io_broadcaster = require('../io_broadcaster');

const sendAssistanceRequestStatus = async (socket, uid, cid) => {
	const count = await AssistanceRequest.countDocuments({course: cid, student: uid, resolved: false})
	socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
};

const teacherResolveAssistanceRequest = async (arid) => {
	await AssistanceRequest.findById(arid).update({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()});
	io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
};

const initiateAssistanceRequest = async (uid, cid) => {
	// If there is not already an unresolved request for this student & class, create one and broadcast modify
	if (!(await AssistanceRequest.findOne({student: uid, course: cid, resolved: false}))) {
		await AssistanceRequest.create({student: uid, course: cid, resolved: false});
		io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
	} // Else do nothing
};

module.exports = {
	sendAssistanceRequestStatus: sendAssistanceRequestStatus,
	teacherResolveAssistanceRequest: teacherResolveAssistanceRequest,
	initiateAssistanceRequest: initiateAssistanceRequest
};
