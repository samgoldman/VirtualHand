/**
 * Handles routing for updating the SSL certificate
 */

module.exports = function(app) {
	// Stores all SSL challenges
	var SSL_CHALLENGES = {test:"test.123"};
	
	// Send out the challenges when requested with the given ID
	app.get('/.well-known/acme-challenge/:id', function(req, res){
		res.send(SSL_CHALLENGES[req.params.id]);
	});
	
	// Store the given challenge and ID.
	// Challenge format:
	// abc123-4kjfdsljf.jdflsajoier
	// ID is everything prior to the '.'
	app.post('/XeujDlPmEGtZRVihXr80ISQuvdF2I9t8ldtJMALUmuWjly7v2hSA1mWfgnFrrI5vT0Wtiq5cqG3V44Nct8n4wDmhqzNo2SOTfT50GSGkWgVZCY14SRCqQ9uvymUADn5Y', function(req, res){
		SSL_CHALLENGES[req.body.challenge.substring(0, req.body.challenge.indexOf("."))] = req.body.challenge;
		res.send('200');
	});
	
	

	/////////////////////////////////////////////////////////////////////
	//Old version. If used in future, don't forget to re-include the various requirements
	
	//	app.get('/.well-known/acme-challenge/nV35XdXqpevsrrlBxxv_8rJhBtNd1nMWdwxUACOpKH8', function(req, res){
	//		var readStream = fs.createReadStream(__dirname + '/SSL');
	//		readStream.pipe(res);
	//	});
};
