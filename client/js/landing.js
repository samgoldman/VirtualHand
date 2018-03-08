let socket = io.connect();
$(window).scroll(function() {
	let windowScroll = $(window).scrollTop();
	if (windowScroll >= 100) {
		$('nav').addClass('fixed');
		$('.wrapper section').each(function(i) {
			if ($(this).position().top <= windowScroll - 100) {
				$('nav a.active').removeClass('active');
				$('nav a').eq(i).addClass('active');
			}
		});
	} else {
		$('nav').removeClass('fixed');
		$('nav a.active').removeClass('active');
		$('nav a:first').addClass('active');
	}
}).scroll();
$(function() {
	$('a[href*=#]:not([href=#])').click(function() {
		if (location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '') && location.hostname === this.hostname) {
			let target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target[0].id === "contact_us") {
				if (target.length) {
					$('html,body').animate({
						scrollTop : target.offset().top
					}, 1000);
					return false;
				}
			}
		}
	});
});
$(document).on('click', '.navbar-collapse.in', function(e) {
	if ($(e.target).is('a')) {
		$(this).collapse('hide');
	}
});