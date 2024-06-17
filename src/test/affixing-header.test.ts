import { Window } from 'happy-dom';
import { beforeEach, describe, expect, it } from 'vitest';

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

// @ts-expect-error happy-dom’s Window doesn’t satisfy globalThis.window’s type
globalThis.window = new Window({ url: 'https://localhost:8080' });
globalThis.document = window.document;
document.body.innerHTML =
    '<style>#fixture {min-height:200vh;} #nav {height: 30px;}</style><div id="fixture"><nav id="nav">Affixing Header</nav></div>';

const affixingHeader = (await import('../affixing-header.js')).default;

function triggerScroll(delta: number) {
    // first apply the scroll change
    window.scrollTo(window.scrollX, window.scrollY + delta);
    // then trigger the scroll event
    window.dispatchEvent(new window.Event('scroll'));
}

describe('affixingHeader', function () {
    const nav = document.getElementById('nav')!;

    beforeEach(async () => {
        window.scrollTo(0, 0);
    });

    it('takes a DOM element and styles it so that it reveals when user scrolls upwards and becomes fixed', async () => {
        const cleanup = affixingHeader(nav);
        expect(nav.style.position).toBe('absolute');
        expect(nav.style.top).toBe('0px');
        for (let index = 0; index < 5; index++) {
            triggerScroll(20);
            await delay(0);
        }
        expect(nav.style.position).toBe('absolute');
        expect(nav.style.top).toBe('0px');
        // trigger a “deliberate” scroll up
        for (let index = 0; index < 8; index++) {
            triggerScroll(-2);
            await delay(0);
        }
        expect(nav.style.position).toBe('absolute');
        expect(parseInt(nav.style.top, 10)).toBeGreaterThan(30);
        triggerScroll(-30);
        await delay(0);
        expect(nav.style.position).toBe('fixed');
        expect(nav.style.top).toBe('0px');
        cleanup();
        expect(nav.style.position).toBe('');
        expect(nav.style.top).toBe('');
    });
});
