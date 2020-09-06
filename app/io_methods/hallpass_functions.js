const HallPassRequest = require('../models/hallPassRequest').model;
const io_broadcaster = require('../io_broadcaster');

const sendHallPassRequestStatus = async (socket, uid, cid) => {
    const request = await HallPassRequest.findOne({course: cid, student: uid, resolved: false}).exec();

    socket.emit('Response_HallPassRequestStatus', {request: request})
};

const studentResolveHallPassRequest = async (student_id, course_id) => {
    try {
        await HallPassRequest.find({student: student_id, course: course_id, resolved: false})
            .updateMany({resolved: true, resolved_type: 'student', resolvedTime: Date.now()});
        io_broadcaster.broadcastGlobally('Broadcast_HallPassRequestModified', null);
    } catch(err) {
        console.log(err);
    };
}

module.exports = {
    sendHallPassRequestStatus: sendHallPassRequestStatus,
    studentResolveHallPassRequest: studentResolveHallPassRequest
};
