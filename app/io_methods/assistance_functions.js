const AssistanceRequest = require('../models/assistanceRequest').model;
const Course = require('../models/course').model;
const io_broadcaster = require('../io_broadcaster');

const sendAssistanceRequestStatus = async (socket, uid, cid) => {
	const count = await AssistanceRequest.countDocuments({course: cid, student: uid, resolved: false})
	socket.emit('Response_AssistanceRequestStatus', {status: (count !== 0)})
};

const teacherResolveAssistanceRequest = async (arid) => {
	await AssistanceRequest.findById(arid).updateOne({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()});
	io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
};

const initiateAssistanceRequest = async (uid, cid) => {
	// If there is not already an unresolved request for this student & class, create one and broadcast modify
	if (!(await AssistanceRequest.findOne({student: uid, course: cid, resolved: false}))) {
		await AssistanceRequest.create({student: uid, course: cid, resolved: false});
		io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
	} // Else do nothing
};

const resolveAssistanceRequestByStudentAndClass = async (uid, cid) => {
	await AssistanceRequest.find({student: uid, course: cid, resolved: false})
		.updateMany({resolved: true, resolved_type: 'student', resolvedTime: Date.now()});
	io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
};

const retrieveAssistanceRequests = async (socket, cids) => {
	const requests = await AssistanceRequest.find({course: {$in: cids}, resolved: false})
		.sort('requestTime').populate('student');
	socket.emit('Response_RetrieveAssistanceRequests', {requests: requests});
};

const teacherResolveAllAssistanceRequests = async (uid, cid) => {
	await Course.verifyCourseTaughtBy(cid, uid);
	await AssistanceRequest.find({course: cid, resolved: false}).updateMany({resolved: true, resolved_type: 'teacher', resolvedTime: Date.now()});
	io_broadcaster.broadcastGlobally('Broadcast_AssistanceRequestModified', null);
};

module.exports = {
	sendAssistanceRequestStatus: sendAssistanceRequestStatus,
	teacherResolveAssistanceRequest: teacherResolveAssistanceRequest,
	initiateAssistanceRequest: initiateAssistanceRequest,
	resolveAssistanceRequestByStudentAndClass: resolveAssistanceRequestByStudentAndClass,
	retrieveAssistanceRequests: retrieveAssistanceRequests,
	teacherResolveAllAssistanceRequests: teacherResolveAllAssistanceRequests 
};
