const AssistanceRequest = require('../models/assistanceRequest').model;

const sendAssistanceRequestStatus = async (socket, uid, cid) => {
	const count = await AssistanceRequest.countDocuments({course: cid, student: uid, resolved: false})
	socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
};

module.exports = {
    sendAssistanceRequestStatus: sendAssistanceRequestStatus
};
