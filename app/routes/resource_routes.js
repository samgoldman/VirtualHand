/**
 * Handles routing for all static files
 */

var fs = require('fs');
var path = require('path');

module.exports = function(app) {

	var dingFilepath = path.join(__dirname + '/../../client/static/ding.wav');
	var stlLogoFilepath = path.join(__dirname + '/../../client/static/stl_logo.png');
	var vhLogoFilepath = path.join(__dirname + '/../../client/static/vh_logo.png');
	
	app.get('/stl_logo', function(req, res) {
		res.set({
			'Content-Type' : 'image/png'
		});
		var readStream = fs.createReadStream(stlLogoFilepath);
		readStream.pipe(res);
	});
	
	app.get('/vh_logo', function(req, res) {
		res.set({
			'Content-Type' : 'image/png'
		});
		var readStream = fs.createReadStream(vhLogoFilepath);
		readStream.pipe(res);
	});

	app.get('/notification_audio', function(req, res) {
		res.set({
			'Content-Type' : 'audio/mpeg'
		});
		var readStream = fs.createReadStream(dingFilepath);
		readStream.pipe(res);
	});
};