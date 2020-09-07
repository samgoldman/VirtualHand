const HallPassRequest = require('../models/hallPassRequest').model;
const Enrollment = require('../models/enrollment').model;
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
};

const initiateHallPassRequest = async (student_id, course_id) => {
    try {
        await Enrollment.confirmStudentInClass(student_id, course_id); // Throws an error is student is not in the course
        const existing_request = await HallPassRequest.findOne({student: student_id, course: course_id, resolved: false});

        if (null === existing_request || undefined === existing_request) {
            await HallPassRequest.create({student: student_id, course: course_id, resolved: false, granted: false});
            io_broadcaster.broadcastGlobally('Broadcast_HallPassRequestModified', null);
        }   // Otherwise, there's already an existing request, so ignore the request to initiate one
    } catch(err) {
        console.log(err);
    }
}

module.exports = {
    sendHallPassRequestStatus: sendHallPassRequestStatus,
    studentResolveHallPassRequest: studentResolveHallPassRequest,
    initiateHallPassRequest: initiateHallPassRequest
};
