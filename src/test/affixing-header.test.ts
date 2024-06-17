import { Window } from 'happy-dom';
import { beforeEach, describe, expect, it } from 'vitest';

const delay = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

// @ts-expect-error happy-dom’s Window doesn’t satisfy globalThis.window’s type
globalThis.window = new Window({ url: 'https://localhost:8080' });
globalThis.document = window.document;
document.body.innerHTML =
    '<style>.root {min-height:200vh;} nav {height: 30px;}</style><div class="root"><nav id="nav">Affixing Header</nav></div>';

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
        expect(nav).toHaveStyle({ position: 'absolute', top: '0px' });
        for (let index = 0; index < 5; index++) {
            triggerScroll(20);
            await delay(0);
        }
        expect(nav).toHaveStyle({ position: 'absolute', top: '0px' });
        // trigger a “deliberate” scroll up
        for (let index = 0; index < 8; index++) {
            triggerScroll(-2);
            await delay(0);
        }
        expect(nav).toHaveStyle({ position: 'absolute' });
        expect(parseInt(nav.style.top, 10)).toBeGreaterThan(30);
        triggerScroll(-30);
        await delay(0);
        expect(nav).toHaveStyle({ position: 'fixed', top: '0px' });
        cleanup();
        expect(nav).toHaveStyle({ position: '', top: '' });
    });

    it('uses position: sticky for affixed header if options.useSticky is passed as true', async () => {
        const cleanup = affixingHeader(nav, { useSticky: true });
        expect(nav).toHaveStyle({ position: 'absolute', top: '0px' });
        for (let index = 0; index < 5; index++) {
            triggerScroll(20);
            await delay(0);
        }
        expect(nav).toHaveStyle({ position: 'absolute', top: '0px' });
        // trigger a “deliberate” scroll up
        for (let index = 0; index < 8; index++) {
            triggerScroll(-2);
            await delay(0);
        }
        expect(nav).toHaveStyle({ position: 'absolute' });
        expect(parseInt(nav.style.top, 10)).toBeGreaterThan(30);
        triggerScroll(-30);
        await delay(0);
        expect(nav).toHaveStyle({ position: 'sticky', top: '0px' });
        cleanup();
        expect(nav).toHaveStyle({ position: '', top: '' });
    });

    it('adds classNames when affixing and affixed based on options.classNameAffixed and options.classNameAffixing', async () => {
        const cleanup = affixingHeader(nav, {
            classNameAffixed: 'affixed',
            classNameAffixing: 'affixing',
        });
        expect(nav).not.toHaveClass('affixed');
        expect(nav).not.toHaveClass('affixing');
        for (let index = 0; index < 5; index++) {
            triggerScroll(20);
            await delay(0);
        }
        expect(nav).not.toHaveClass('affixed');
        expect(nav).not.toHaveClass('affixing');
        // trigger a “deliberate” scroll up
        for (let index = 0; index < 8; index++) {
            triggerScroll(-2);
            await delay(0);
        }
        expect(nav).not.toHaveClass('affixed');
        expect(nav).toHaveClass('affixing');
        expect(nav).toHaveStyle({ position: 'absolute' });
        expect(parseInt(nav.style.top, 10)).toBeGreaterThan(30);
        triggerScroll(-30);
        await delay(0);
        expect(nav).toHaveClass('affixed');
        expect(nav).not.toHaveClass('affixing');
        expect(nav).toHaveStyle({ position: 'fixed', top: '0px' });
        for (let index = 0; index < 5; index++) {
            triggerScroll(20);
            await delay(0);
        }
        expect(nav).not.toHaveClass('affixed');
        expect(nav).not.toHaveClass('affixing');
        cleanup();
        expect(nav).toHaveStyle({ position: '', top: '' });
    });
});
