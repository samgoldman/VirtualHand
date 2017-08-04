


module.exports = function(app, passport, startup_time) {
	console.log('Initiating routes')
	require('./ssl_update_routes.js')(app);
	require('./common_routes.js')(app);
	require('./public_routes.js')(app, passport);
	require('./teacher_routes.js')(app);
	require('./admin_routes.js')(app, startup_time);
	require('./student_routes.js')(app);
	require('./resource_routes.js')(app);
	console.log('Done initiating routes')
}