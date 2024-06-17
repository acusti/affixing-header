import onscrolling from 'onscrolling';

// Create window fallback if needed for SSR
const window = globalThis.window ?? globalThis;

// Keep track of:
// - state of nav bar
// - scrolling direction
// - “deliberateness” of scroll in current direction (for affixing header, it shouldn't be just a casual slip)
// - state when transitioning for adjusting position
let scrollYPrevious: number | null = null;
let scrollY: number | null = null;
let upScrollCount = 0;
let isNavAffixed = false;
let isNavTransitioning = false;
let resizeTimeoutID: number | null = null;
let affixedPosition: 'fixed' | 'sticky' = 'fixed';
let classNameAffixed: string | null = null;
let classNameAffixing: string | null = null;
let header: HTMLElement | null = null;
let headerDimensions: { height?: number; top?: number } = {};
let documentDimensions: {
    clientHeight?: number;
    scrollHeight?: number;
} = {};

function affixNavBar() {
    if (!header) return;

    isNavAffixed = true;
    isNavTransitioning = false;
    if (classNameAffixed) {
        header.classList.add(classNameAffixed);
    }
    if (classNameAffixing) {
        header.classList.remove(classNameAffixing);
    }
    header.style.position = affixedPosition;
    header.style.top = '0px';
    headerDimensions.top = 0;
}

function unaffixNavBar() {
    if (
        !header ||
        !isNavAffixed ||
        headerDimensions.height == null ||
        scrollY == null ||
        scrollYPrevious == null
    ) {
        // nothing to do here
        return;
    }
    upScrollCount = 0;
    isNavAffixed = false;
    if (classNameAffixed) {
        header.classList.remove(classNameAffixed);
    }
    if (classNameAffixing) {
        header.classList.remove(classNameAffixing);
    }
    let newHeaderTop: number | null = null;
    // only set top position for switch from fixed to absolute if not transitioning
    if (!isNavTransitioning) {
        // if user jumped down the page (e.g. paging with spacebar)
        if (scrollY > scrollYPrevious + headerDimensions.height + 5) {
            newHeaderTop = scrollYPrevious + 5;
        } else {
            newHeaderTop = scrollY;
        }
    } else {
        isNavTransitioning = false;
    }

    if (newHeaderTop != null) {
        header.style.top = newHeaderTop + 'px';
        headerDimensions.top = newHeaderTop;
    }

    header.style.position = 'absolute';
}

function checkNavPosition() {
    if (!isNavAffixed && headerDimensions.top! > scrollY!) {
        affixNavBar();
        return true;
    }
    return false;
}

function handleScroll({
    scrollY: scrollYCurrent,
}: {
    scrollX: number;
    scrollY: number;
}) {
    scrollY = scrollYCurrent;
    // type guard for null values
    if (
        header == null ||
        documentDimensions.clientHeight == null ||
        documentDimensions.scrollHeight == null ||
        headerDimensions.height == null ||
        headerDimensions.top == null ||
        scrollYPrevious == null
    ) {
        return;
    }
    // if this is bounce scrolling (e.g. Mac OS, iOS), bail
    if (scrollY < 0) return;

    const scrollDelta = scrollY - scrollYPrevious;
    scrollYPrevious = scrollY;
    // ensures nav bar isn’t stranded in the middle of the page; returns true if handled
    if (checkNavPosition()) return;

    if (scrollDelta < 0) {
        if (
            // if the user has scrolled up quickly / jumped up (like shift-spacebar)
            (!isNavAffixed && scrollDelta > headerDimensions.height) ||
            // or we are transitioning and have reached the top of the bar
            (isNavTransitioning && scrollY <= headerDimensions.top + 2)
        ) {
            affixNavBar();
        } else if (!isNavAffixed && !isNavTransitioning) {
            if (upScrollCount > 6) {
                isNavAffixed = true;
                // Need header height, so update cached dimensions
                headerDimensions.height = header.offsetHeight;
                // If the navbar is not currently visible, set the top to just above the viewport so it appears as we scroll up
                if (scrollY > headerDimensions.top + headerDimensions.height + 25) {
                    headerDimensions.top = scrollY - headerDimensions.height - 25;
                    header.style.top = headerDimensions.top + 'px';
                    if (classNameAffixing) {
                        header.classList.add(classNameAffixing);
                    }
                }
                isNavTransitioning = true;
            }
            upScrollCount++;
        }
    } else if (isNavAffixed) {
        unaffixNavBar();
    }
}

function calculateDimensions() {
    resizeTimeoutID = null;
    scrollY = scrollYPrevious = window.scrollY;
    documentDimensions.clientHeight = document.documentElement.clientHeight;
    documentDimensions.scrollHeight = document.documentElement.scrollHeight;
    headerDimensions.height = header?.offsetHeight;
}

function onResizeDebouncer() {
    if (resizeTimeoutID != null) {
        window.clearTimeout(resizeTimeoutID);
    }
    resizeTimeoutID = window.setTimeout(calculateDimensions, 150);
}

type Options = {
    classNameAffixed?: string;
    classNameAffixing?: string;
    useSticky?: boolean;
};

export default function (navElement: HTMLElement, options: Options = {}) {
    // set initial state
    header = navElement;
    affixedPosition = options.useSticky ? 'sticky' : 'fixed';
    if (options.classNameAffixed) {
        classNameAffixed = options.classNameAffixed;
    }
    if (options.classNameAffixing) {
        classNameAffixing = options.classNameAffixing;
    }
    const initialHeaderPosition = header.style.position;
    const initialHeaderTop = header.style.top;
    header.style.position = 'absolute';
    header.style.top = '0px';
    headerDimensions.top = 0;
    // trigger calculations caching and attach debouncer to resize event
    calculateDimensions();
    window.addEventListener('resize', onResizeDebouncer);
    // use onscrolling helper to listen for scroll changes
    const cleanupOnscrolling = onscrolling(handleScroll, { vertical: true });

    return () => {
        cleanupOnscrolling();
        window.removeEventListener('resize', onResizeDebouncer);
        // reset module state
        if (header) {
            header.style.position = initialHeaderPosition;
            header.style.top = initialHeaderTop;
            if (classNameAffixed) {
                header.classList.remove(classNameAffixed);
            }
            if (classNameAffixing) {
                header.classList.remove(classNameAffixing);
            }
            header = null;
        }
        affixedPosition = 'fixed';
        classNameAffixed = classNameAffixing = null;
        headerDimensions = documentDimensions = {};
        isNavTransitioning = isNavAffixed = false;
        scrollY = scrollYPrevious = null;
        upScrollCount = 0;
        if (resizeTimeoutID != null) {
            window.clearTimeout(resizeTimeoutID);
            resizeTimeoutID = null;
        }
    };
}
