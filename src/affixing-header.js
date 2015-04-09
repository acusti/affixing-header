'use strict';

import onscrolling from 'onscrolling';

// Keep track of:
// - state of nav bar
// - scrolling direction
// - "deliberateness" of scroll in current direction (for affixing header, it shouldn't be just a casual slip)
// - state when transitioning for adjusting position
var verticalTolerance  = 7,
    scrollYPrev        = 0,
    scrollY            = 0,
    upScrollCount      = 0,
    isNavAffixed       = false,
    isNavTransitioning = false,
    documentDimensions = {},
    headerDimensions   = {},
    header,
    resizeTimeoutId;

function affixNavBar() {
    isNavAffixed          = true;
    isNavTransitioning    = false;
    header.style.position = 'fixed';
    header.style.top      = verticalTolerance * -1 + 'px';
    headerDimensions.top  = verticalTolerance * -1;
}

function unAffixNavBar() {
    var newHeaderTop = false;
	if (!isNavAffixed) {
		// Nothing to do here
		return;
	}
    upScrollCount = 0;
    isNavAffixed  = false;
	// Only set top position for switch from fixed absolute if not transitioning
	if (!isNavTransitioning) {
		// If user jumped down the page (e.g. paging with spacebar)
		if (scrollY > scrollYPrev + headerDimensions.height + 5) {
            newHeaderTop = scrollYPrev + 5;
		} else {
			newHeaderTop = scrollY;
		}
	} else {
		isNavTransitioning = false;
	}
    if (newHeaderTop !== false) {
        header.style.top     = newHeaderTop - verticalTolerance + 'px';
        headerDimensions.top = newHeaderTop - verticalTolerance;
    }
	header.style.position = 'absolute';
}

function checkNavPosition() {
	if (!isNavAffixed && headerDimensions.top > scrollY) {
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
	if (scrollY < 0 || documentDimensions.scrollHeight - documentDimensions.scrollTop < documentDimensions.clientHeight) {
		return;
	}
	if (scrollY < scrollYPrev) {
		// If the user has scrolled up quickly / jumped up (like shift-spacebar)
		// Or we are transitioning and have reached the top of the bar
		if ((!isNavAffixed && scrollY + headerDimensions.height + 10 < scrollYPrev) || isNavTransitioning && scrollY <= headerDimensions.top + verticalTolerance + 2) {
			affixNavBar();
		} else if (!isNavAffixed && !isNavTransitioning) {
			if (upScrollCount > 6) {
				isNavAffixed = true;
                // Need header height, so update cached dimensions
                headerDimensions.height = header.offsetHeight;
				// If the navbar is not currently visible, set the top to just above the viewport so it appears as we scroll up
				if (scrollY > headerDimensions.top + headerDimensions.height + 25) {
                    headerDimensions.top = scrollY - headerDimensions.height - 25;
                    header.style.top     = headerDimensions.top + 'px';
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

function calculateDimensions() {
    documentDimensions.clientHeight = document.documentElement.clientHeight;
    documentDimensions.scrollHeight = document.documentElement.scrollHeight;
    documentDimensions.scrollTop    = document.documentElement.scrollTop;
    headerDimensions.height         = header.offsetHeight;
}

function onResizeDebouncer() {
    if (resizeTimeoutId) {
        window.clearTimeout(resizeTimeoutId);
    }
    window.setTimeout(calculateDimensions, 150);
}

export default function(navElement) {
    var headerStyles, headerTopBorderWidth;
	if (!navElement) {
		return;
	}
    // Set initial state
    header                = navElement;
    header.style.position = 'absolute';
    header.style.top      = verticalTolerance * -1 + 'px';
    headerDimensions.top  = verticalTolerance * -1;
    headerStyles          = window.getComputedStyle(header);
    headerTopBorderWidth  = parseInt(headerStyles.getPropertyValue('border-top-width'), 10);
    // Vertical tolerance is an extra amount of space above the header used to help avoid unseemly flashes while scrolling
    // Add it via the top border of the header
    if (headerTopBorderWidth === 0) {
        header.style.borderTopColor = headerStyles.getPropertyValue('background-color');
        header.style.borderTopStyle = 'solid';
    }
    header.style.borderTopWidth = headerTopBorderWidth + verticalTolerance + 'px';
    // Trigger calculations caching and attach debouncer to resize event
    calculateDimensions();
    window.addEventListener('resize', onResizeDebouncer);
    // Use onscrolling helper to listen for scroll changes
	onscrolling(handleScroll);
}
