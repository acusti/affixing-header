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
        _onscrolling__scrollY        = window.pageYOffset,
        scrollX        = window.pageXOffset,
        scrollYCached  = _onscrolling__scrollY,
        scrollXCached  = scrollX,
        directionX     = ['x', 'horizontal'],
        // directionY     = [ 'y', 'vertical'],
        directionAll   = ['any'],
        callbackQueue  = {
            x   : [],
            y   : [],
            any : []
        };

    function _onscrolling__handleScroll() {
    	var i;

    	if (_onscrolling__scrollY !== scrollYCached) {
            for (i = 0; i < callbackQueue.y.length; i++) {
        		callbackQueue.y[i](_onscrolling__scrollY);
        	}
            scrollYCached = _onscrolling__scrollY;
        }
    	if (scrollX !== scrollXCached) {
            for (i = 0; i < callbackQueue.x.length; i++) {
        		callbackQueue.x[i](scrollX);
        	}
            scrollXCached = scrollX;
        }
        for (i = 0; i < callbackQueue.any.length; i++) {
            callbackQueue.any[i]([scrollX, _onscrolling__scrollY]);
        }

        isQueued = false;
    }

    function requestTick() {
    	if (!isQueued) {
    		requestFrame(_onscrolling__handleScroll);
    	}
    	isQueued = true;
    }

    function onScrollDebouncer() {
        if (callbackQueue.x.length || callbackQueue.any.length) {
            scrollX = window.pageXOffset;
        }
        if (callbackQueue.y.length || callbackQueue.any.length) {
            _onscrolling__scrollY = window.pageYOffset;
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
    function onscrolling(direction, callback) {
    	if (!isSupported) {
    		return;
    	}
    	if (!isListening) {
    		window.addEventListener('scroll', onScrollDebouncer);
    		document.body.addEventListener('touchmove', onScrollDebouncer);
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

    onscrolling.remove = function(direction, fn) {
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
    onscrolling.off = onscrolling.remove;

    var _onscrolling = onscrolling;

    'use strict';

    var scrollYPrev        = 0,
        affixing_header__scrollY            = 0,
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
        header.style.top      = '0px';
        headerDimensions.top  = 0;
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
    		if (affixing_header__scrollY > scrollYPrev + headerDimensions.height + 5) {
                newHeaderTop = scrollYPrev + 5;
    		} else {
    			newHeaderTop = affixing_header__scrollY;
    		}
    	} else {
    		isNavTransitioning = false;
    	}
        if (newHeaderTop !== false) {
            header.style.top     = newHeaderTop + 'px';
            headerDimensions.top = newHeaderTop;
        }
    	header.style.position = 'absolute';
    }

    function checkNavPosition() {
    	if (!isNavAffixed && headerDimensions.top > affixing_header__scrollY) {
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
    	if (affixing_header__scrollY < 0 || documentDimensions.scrollHeight - documentDimensions.scrollTop < documentDimensions.clientHeight) {
    		return;
    	}
    	if (affixing_header__scrollY < scrollYPrev) {
    		// If the user has scrolled up quickly / jumped up (like shift-spacebar)
    		// Or we are transitioning and have reached the top of the bar
    		if ((!isNavAffixed && affixing_header__scrollY + headerDimensions.height + 10 < scrollYPrev) || isNavTransitioning && affixing_header__scrollY <= headerDimensions.top + 2) {
    			affixNavBar();
    		} else if (!isNavAffixed && !isNavTransitioning) {
    			if (upScrollCount > 6) {
    				isNavAffixed = true;
                    // Need header height, so update cached dimensions
                    headerDimensions.height = header.offsetHeight;
    				// If the navbar is not currently visible, set the top to just above the viewport so it appears as we scroll up
    				if (affixing_header__scrollY > headerDimensions.top + headerDimensions.height + 25) {
                        headerDimensions.top = affixing_header__scrollY - headerDimensions.height - 25;
                        header.style.top     = headerDimensions.top + 'px';
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

    var affixing_header = function(navElement) {
    	if (!navElement) {
    		return;
    	}
        // Set initial state
        header                = navElement;
        header.style.position = 'absolute';
        header.style.top      = '0px';
        headerDimensions.top  = 0;
        // Trigger calculations caching and attach debouncer to resize event
        calculateDimensions();
        window.addEventListener('resize', onResizeDebouncer);
        // Use onscrolling helper to listen for scroll changes
    	_onscrolling(affixing_header__handleScroll);
    }

    return affixing_header;

}));