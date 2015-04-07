(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.affixingHeader = factory()
}(this, function () { 'use strict';

    'use strict';

    var requestFrame  = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
        isSupported    = requestFrame !== undefined,
        isListening    = false,
        isQueued       = false,
        onscroll__scrollY        = window.pageYOffset,
        scrollX        = window.pageXOffset,
        scrollYCached  = onscroll__scrollY,
        scrollXCached  = scrollX,
        directionX     = ['x', 'horizontal'],
        // directionY     = [ 'y', 'vertical'],
        directionAll   = ['any'],
        callbackQueue  = {
            x   : [],
            y   : [],
            any : []
        },
        onscroll__handleScroll,
        onscroll__onScrollDebouncer,
        onscroll__onscrolling;

    function onscroll__handleScroll() {
    	var i;

    	if (onscroll__scrollY !== scrollYCached) {
            for (i = 0; i < callbackQueue.y.length; i++) {
        		callbackQueue.y[i](onscroll__scrollY);
        	}
            scrollYCached = onscroll__scrollY;
        }
    	if (scrollX !== scrollXCached) {
            for (i = 0; i < callbackQueue.x.length; i++) {
        		callbackQueue.x[i](scrollX);
        	}
            scrollXCached = scrollX;
        }
        for (i = 0; i < callbackQueue.any.length; i++) {
            callbackQueue.any[i]([scrollX, onscroll__scrollY]);
        }

        isQueued = false;
    }

    function requestTick() {
    	if (!isQueued) {
    		requestFrame(onscroll__handleScroll);
    	}
    	isQueued = true;
    }

    function onscroll__onScrollDebouncer() {
        if (callbackQueue.x.length || callbackQueue.any.length) {
            scrollX = window.pageXOffset;
        }
        if (callbackQueue.y.length || callbackQueue.any.length) {
            onscroll__scrollY = window.pageYOffset;
        }
    	requestTick();
    }

    /**
     * Attach callback to debounced scroll event
     *
     * Takes two forms:
     * @param function callback  Function to attach to a vertical scroll event
     * Or:
     * @param string   direction Direction of scroll to attach to:
     *                 'horizontal'/'x', 'vertical'/'y' (the default),
     *                 or 'any' (listens to both)
     * @param function callback  Function to attach to a scroll event in specified direction
     */
    function onscroll__onscrolling(direction, callback) {
    	if (!isSupported) {
    		return;
    	}
    	if (!isListening) {
    		window.addEventListener('scroll', onscroll__onScrollDebouncer);
    		document.body.addEventListener('touchmove', onscroll__onScrollDebouncer);
    		isListening = true;
    	}
        // Verify parameters
        if (typeof direction === 'function') {
            callback = direction;
            callbackQueue.y.push(callback);
            return;
        }
        if (typeof callback === 'function') {
            if (~directionX.indexOf(direction)) {
                callbackQueue.x.push(callback);
            } else if (~directionAll.indexOf(direction)) {
                callbackQueue.any.push(callback);
            } else {
                callbackQueue.y.push(callback);
            }
        }
    }

    onscroll__onscrolling.remove = function(direction, fn) {
        var queueKey = 'y',
            queue,
            fnIdx;

        if (typeof direction === 'string') {
            // If second parameter is not a function, return
            if (typeof fn !== 'function') {
                return;
            }
            if (~directionX.indexOf(direction)) {
                queueKey = directionX[0];
            } else if (~directionAll.indexOf(direction)) {
                queueKey = directionAll[0];
            }
        } else {
            fn = direction;
        }
        queue = callbackQueue[queueKey];
        fnIdx = queue.indexOf(fn);
        if (fnIdx > -1) {
            queue.splice(fnIdx, 1);
        }
    };
    onscroll__onscrolling.off = onscroll__onscrolling.remove;

    var onscroll = onscroll__onscrolling;

    'use strict';

    var scrollYPrev        = 0,
        affixing_header__scrollY            = 0,
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
    		if (affixing_header__scrollY > scrollYPrev + header.clientHeight + 5) {
    			header.style.top = scrollYPrev + 5 + 'px';
    		} else {
    			header.style.top = affixing_header__scrollY + 'px';
    		}
    	} else {
    		isNavTransitioning = false;
    	}
    	header.style.position = 'absolute';
    }

    function checkNavPosition() {
    	if (!isNavAffixed && header.offsetTop > affixing_header__scrollY) {
    		affixNavBar();
    	}
    }

    function affixing_header__handleScroll(scrollYCurrent) {
        affixing_header__scrollY = scrollYCurrent;
    	// Make sure that the nav bar doesn't wind up stranded in the middle of the page
    	checkNavPosition();
    	// If this is bounce scrolling (e.g. Mac OS, iOS), bail
        // Another way to check the top
        //(scrollY + window.innerHeight) > document.documentElement.scrollHeight
    	if (affixing_header__scrollY < 0 || document.documentElement.scrollHeight - document.documentElement.scrollTop < document.documentElement.clientHeight) {
    		return;
    	}
    	if (affixing_header__scrollY < scrollYPrev) {
    		// If the user has scrolled up quickly / jumped up (like shift-spacebar)
    		// Or we are transitioning and have reached the top of the bar
    		if ((!isNavAffixed && affixing_header__scrollY + header.clientHeight + 10 < scrollYPrev) || (isNavTransitioning && affixing_header__scrollY <= header.offsetTop + 2)) {
    			affixNavBar();
    		} else if (!isNavAffixed) {
    			if (upScrollCount > 6) {
    				//downScrollCount = 0;
    				isNavAffixed = true;
    				// If the navbar is not currently visible, set the top to just above the viewport so it appears as we scroll up
    				if (affixing_header__scrollY > header.offsetTop + header.clientHeight + 5) {
    					header.style.top = (affixing_header__scrollY - header.clientHeight) + 'px';
    				}
    				isNavTransitioning = true;
    			}
    			upScrollCount++;
    		}
    	} else if (isNavAffixed) {
    		unAffixNavBar();
    	}
    	scrollYPrev = affixing_header__scrollY;
    }

    var affixing_header = function(navElement) {
    	if (!navElement) {
    		return;
    	}
        // Set initial state
    	header                = navElement;
        header.style.top      = 0;
        header.style.position = 'absolute';
        // Use onscroll helper to listen for scroll changes
    	onscroll(affixing_header__handleScroll);
    }

    return affixing_header;

}));