import onscrolling from 'onscrolling';

// Create window fallback if needed for SSR
const window = globalThis.window ?? globalThis;

// Keep track of:
// - state of nav bar
// - scrolling direction
// - “deliberateness” of scroll in current direction (for affixing header, it shouldn't be just a casual slip)
// - state when transitioning for adjusting position
let scrollYPrevious = 0;
let scrollY = 0;
let upScrollCount = 0;
let isNavAffixed = false;
let isNavTransitioning = false;
let resizeTimeoutID: number | null = null;
let header: HTMLElement | null = null;
let headerDimensions: { height?: number; top?: number } = {};
let affixedPosition: 'fixed' | 'sticky' = 'fixed';
const documentDimensions: {
    clientHeight?: number;
    scrollHeight?: number;
    scrollTop?: number;
} = {};

function affixNavBar() {
    if (!header) return;

    isNavAffixed = true;
    isNavTransitioning = false;
    header.style.position = affixedPosition;
    header.style.top = '0px';
    headerDimensions.top = 0;
}

function unaffixNavBar() {
    if (!isNavAffixed || !header || headerDimensions.height == null) {
        // Nothing to do here
        return;
    }
    let newHeaderTop: number | null = null;
    upScrollCount = 0;
    isNavAffixed = false;
    // Only set top position for switch from fixed absolute if not transitioning
    if (!isNavTransitioning) {
        // If user jumped down the page (e.g. paging with spacebar)
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
    if (
        !isNavAffixed &&
        headerDimensions.top != null &&
        headerDimensions.top > scrollY
    ) {
        affixNavBar();
    }
}

function handleScroll({
    scrollY: scrollYCurrent,
}: {
    scrollX: number;
    scrollY: number;
}) {
    scrollY = scrollYCurrent;
    // Make sure that the nav bar doesn't wind up stranded in the middle of the page
    checkNavPosition();
    // Type guard for null values
    if (
        header == null ||
        documentDimensions.clientHeight == null ||
        documentDimensions.scrollHeight == null ||
        documentDimensions.scrollTop == null ||
        headerDimensions.height == null ||
        headerDimensions.top == null
    ) {
        return;
    }
    // If this is bounce scrolling (e.g. Mac OS, iOS), bail
    // Another way to check the top
    //(scrollY + window.innerHeight) > document.documentElement.scrollHeight
    if (
        scrollY < 0 ||
        documentDimensions.scrollHeight - documentDimensions.scrollTop <
            documentDimensions.clientHeight
    ) {
        return;
    }

    if (scrollY < scrollYPrevious) {
        // If the user has scrolled up quickly / jumped up (like shift-spacebar)
        // Or we are transitioning and have reached the top of the bar
        if (
            (!isNavAffixed &&
                scrollY + headerDimensions.height + 10 < scrollYPrevious) ||
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
                }
                isNavTransitioning = true;
            }
            upScrollCount++;
        }
    } else if (isNavAffixed) {
        unaffixNavBar();
    }
    scrollYPrevious = scrollY;
}

function calculateDimensions() {
    resizeTimeoutID = null;
    documentDimensions.clientHeight = document.documentElement.clientHeight;
    documentDimensions.scrollHeight = document.documentElement.scrollHeight;
    documentDimensions.scrollTop = document.documentElement.scrollTop;
    headerDimensions.height = header?.offsetHeight;
}

function onResizeDebouncer() {
    if (resizeTimeoutID != null) {
        window.clearTimeout(resizeTimeoutID);
    }
    resizeTimeoutID = window.setTimeout(calculateDimensions, 150);
}

export default function (
    navElement: HTMLElement,
    { useSticky }: { useSticky?: boolean } = {},
) {
    // Set initial state
    header = navElement;
    affixedPosition = useSticky ? 'sticky' : 'fixed';
    const initialHeaderPosition = header.style.position;
    const initialHeaderTop = header.style.top;
    header.style.position = 'absolute';
    header.style.top = '0px';
    headerDimensions.top = 0;
    // Trigger calculations caching and attach debouncer to resize event
    calculateDimensions();
    window.addEventListener('resize', onResizeDebouncer);
    // Use onscrolling helper to listen for scroll changes
    const cleanupOnscrolling = onscrolling(handleScroll, { vertical: true });

    return () => {
        cleanupOnscrolling();
        if (header) {
            header.style.position = initialHeaderPosition;
            header.style.top = initialHeaderTop;
            header = null;
        }
        headerDimensions = {};
        window.removeEventListener('resize', onResizeDebouncer);
    };
}
