# Affixing Header&nbsp; [![Build and Test results](https://img.shields.io/github/actions/workflow/status/acusti/affixing-header/build.yml?branch=master&style=for-the-badge)](https://github.com/acusti/affixing-header/actions)

Create an affixing header that behaves normally as a user navigates down a page, but reveals itself naturally when a user scrolls or drags upwards. Inspired by iOS Safari, Medium, and others. See [an example implementation][acusti.ca] to see what it’s about. Works on desktop and mobile browsers.

## Usage

The module is ESM-only and exports a single default `affixingHeader` function:

### `affixingHeader( element )`

#### `element` HTMLElement

The DOM element to which the affixing behavior should be attached. Must be a single `HTMLElement` (e.g., the result of `document.querySelector` or `document.getElementById`), not a `NodeList`.

### affixingHeader return value

#### `affixingHeader` function `(element: HTMLElement) => () => void`

The `affixingHeader` function returns a cleanup function that takes no arguments and is used to remove listeners and cleanup the affixing behavior.

### Dependencies

This package uses [onscrolling][], a requestAnimationFrame-based, performant, mobile-friendly scroll event handler, to listen for page scrolls, but has no other dependencies.

### Compatibility

The scroll handling uses `requestAnimationFrame`, which is [only available in IE10+][raf-caniuse]. To add full support for older browsers, just include a [requestAnimationFrame polyfill][raf-polyfill].

[acusti.ca]: http://www.acusti.ca
[onscrolling]: https://github.com/acusti/onscrolling
[raf-caniuse]: http://caniuse.com/#feat=requestanimationframe
[raf-polyfill]: https://gist.github.com/paulirish/1579671
