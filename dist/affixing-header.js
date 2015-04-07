(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('onscrolling')) :
	typeof define === 'function' && define.amd ? define(['onscrolling'], factory) :
	global.affixingHeader = factory(global.onscrolling)
}(this, function (onscrolling) { 'use strict';

	'use strict';

	var scrollYPrev        = 0,
	    scrollY            = 0,
	    upScrollCount      = 0,
	    //downScrollCount    = 0,
	    isNavAffixed       = false,
	    isNavTransitioning = false,
	    header;

	function affixNavBar() {
	    isNavAffixed          = true;
	    isNavTransitioning    = false;
	    header.style.top      = 0;
	    header.style.position = 'fixed';
	}

	function unAffixNavBar() {
		if (!isNavAffixed) {
			// Nothing to do here
			return;
		}
		upScrollCount = 0;
		isNavAffixed = false;
		// Only set top position for switch from fixed absolute if not transitioning
		if (!isNavTransitioning) {
			// If user jumped down the page (e.g. paging with spacebar)
			if (scrollY > scrollYPrev + header.clientHeight + 5) {
				header.style.top = scrollYPrev + 5 + 'px';
			} else {
				header.style.top = scrollY + 'px';
			}
		} else {
			isNavTransitioning = false;
		}
		header.style.position = 'absolute';
	}

	function checkNavPosition() {
		if (!isNavAffixed && header.offsetTop > scrollY) {
			affixNavBar();
		}
	}

	function handleScroll(scrollYCurrent) {
	    scrollY = scrollYCurrent;
		// Make sure that the nav bar doesn't wind up stranded in the middle of the page
		checkNavPosition();
		// If this is bounce scrolling (e.g. Mac OS, iOS), bail
	    // Another way to check the top
	    //(scrollY + window.innerHeight) > document.documentElement.scrollHeight
		if (scrollY < 0 || document.documentElement.scrollHeight - document.documentElement.scrollTop < document.documentElement.clientHeight) {
			return;
		}
		if (scrollY < scrollYPrev) {
			// If the user has scrolled up quickly / jumped up (like shift-spacebar)
			// Or we are transitioning and have reached the top of the bar
			if ((!isNavAffixed && scrollY + header.clientHeight + 10 < scrollYPrev) || (isNavTransitioning && scrollY <= header.offsetTop + 2)) {
				affixNavBar();
			} else if (!isNavAffixed) {
				if (upScrollCount > 6) {
					//downScrollCount = 0;
					isNavAffixed = true;
					// If the navbar is not currently visible, set the top to just above the viewport so it appears as we scroll up
					if (scrollY > header.offsetTop + header.clientHeight + 5) {
						header.style.top = (scrollY - header.clientHeight) + 'px';
					}
					isNavTransitioning = true;
				}
				upScrollCount++;
			}
		} else if (isNavAffixed) {
			unAffixNavBar();
		}
		scrollYPrev = scrollY;
	}

	return function(navElement) {
		if (!navElement) {
			return;
		}
	    // Set initial state
		header                = navElement;
	    header.style.top      = 0;
	    header.style.position = 'absolute';
	    // Use onscrolling helper to listen for scroll changes
		onscrolling(handleScroll);
	};

}));