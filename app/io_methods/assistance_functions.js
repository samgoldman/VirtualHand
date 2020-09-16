const AssistanceRequest = require('../models/assistanceRequest').model;
const io_broadcaster = require('../io_broadcaster');

const sendAssistanceRequestStatus = async (socket, uid, cid) => {
	const count = await AssistanceRequest.countDocuments({course: cid, student: uid, resolved: false})
	socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
};

const teacherResolveAssistanceRequest = async (arid) => {
	await AssistanceRequest.findById(arid).update({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()});
	io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
}

module.exports = {
	sendAssistanceRequestStatus: sendAssistanceRequestStatus,
	teacherResolveAssistanceRequest: teacherResolveAssistanceRequest
};
