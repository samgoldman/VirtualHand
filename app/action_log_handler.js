var nodemailer = require('nodemailer');
var Handler = require('./action_log_handler');
var Action_Log = require('./models/action_log');

//Create the object used to send the emails
var transporter = nodemailer.createTransport({
	service : 'gmail',
	auth : {
		user : process.env.VH_EMAIL,
		pass : process.env.VH_EMAIL_PASSWORD
	}
});

module.exports = {
		send_contact_us_message: function(name, email, message){
			//Create the message to send to the admin
			var msg = 'From: ' + name + ' \n'
			+ 'Email: ' + email + ' \n'
			+ 'Message: ' + message;
			
			//Send the message to admin via email
			transporter.sendMail({
				from : 'stlsoftwareautomated@gmail.com',
				to : 'support@stlclassrooms.com',
				subject : 'Virtual Hand Customer Feedback',
				text : msg
			}, function(error, info) {
				if (error) {
					console.log(error);
				} else {
					console.log('Message sent: ' + info.response);
				}
			});
		},
		
		//Handler.create_action_log_and_handle(title, level, author, message);
		create_action_log_and_handle: function(title, level, author, message){
			var action_log = new Action_Log();
			action_log.title = title;
			action_log.message = message;
			action_log.author = author;
			action_log.alert_level = level;
			action_log.save();
			
			if(action_log.alert_level >= 1){
				//Create the message to send to the admin
				var msg = 'At ' + action_log.time_stamp + ', an event from ' + action_log.author + ' occured with message: ' + action_log.message;
				
				//Send the message to admin via email
				/**
				transporter.sendMail({
					from : 'stlsoftwareautomated@gmail.com',
					to : 'tech-debug@stlclassrooms.com',
					subject : 'Virtual Hand Event - ' + action_log.title,
					text : msg
				}, function(error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				});
				**/
				
			}
			if(action_log.alert_level >= 2){
				//Send the message to admin via text
				/**
				transporter.sendMail({
					from : 'stlsoftwareautomated@gmail.com',
					to : '3037484324@txt.att.net',
					subject : 'Virtual Hand Event - ' + action_log.title,
					text : msg
				}, function(error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				});
				**/
			}
			
			return action_log;
		},
		handle_log: function(action_log) {
			
			//Action log alert level defenitions:
			//0 == Action recorded
			//1 == Waring - email
			//2 == Error - text and email
			
			//Check if the alert_level indicates the need to notify
			if(action_log.alert_level >= 1){
				//Create the message to send to the admin
				var msg = 'At ' + action_log.time_stamp + ', an event from ' + action_log.author + ' occured with message: ' + action_log.message;
				
				//Send the message to admin via email
				/**
				transporter.sendMail({
					from : 'stlsoftwareautomated@gmail.com',
					to : 'tech-debug@stlclassrooms.com',
					subject : 'Virtual Hand Event - ' + action_log.title,
					text : msg
				}, function(error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				});
				**/
			}
			if(action_log.alert_level >= 2){
				//Send the message to admin via text
				/**
				transporter.sendMail({
					from : 'stlsoftwareautomated@gmail.com',
					to : '3037484324@txt.att.net',
					subject : 'Virtual Hand Event - ' + action_log.title,
					text : msg
				}, function(error, info) {
					if (error) {
						console.log(error);
					} else {
						console.log('Message sent: ' + info.response);
					}
				});
				**/
			}
		}
}
