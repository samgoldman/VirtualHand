function KeyDownHandler(e) {
	var keynum;

	if (window.event) { // IE
		keynum = e.keyCode;
	} else if (e.which) { // Netscape/Firefox/Opera
		keynum = e.which;
	}
	var key = String.fromCharCode(keynum);
	if (key === '1') {
		handDown(0);
	} else if (key === '2') {
		handDown(1);
	} else if (key === '3') {
		handDown(2);
	} else if (key === '4') {
		handDown(3);
	} else if (key === '5') {
		handDown(4);
	}
}

window.addEventListener("load", function(){
	document.body.addEventListener('keyup', KeyDownHandler);
});