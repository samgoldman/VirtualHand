
const handle_home = (req, res) => {
    if (req.user.role === 'teacher') {
        res.redirect('/teacher/home');
    } else if (req.user.role === 'student') {
        res.redirect('/student/home');
    }
};


module.exports = {
    handle_home: handle_home
};