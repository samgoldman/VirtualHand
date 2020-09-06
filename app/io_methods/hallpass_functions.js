const HallPassRequest = require('../models/hallPassRequest').model;

const sendHallPassRequestStatus = async (socket, uid, cid) => {
    const request = await (await HallPassRequest.findOne({course: cid, student: uid, resolved: false})).exec();

    socket.emit('Response_HallPassRequestStatus', {request: request})
};

module.exports = {
	sendHallPassRequestStatus: sendHallPassRequestStatus
};
