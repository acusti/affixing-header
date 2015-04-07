# Affixing Header&nbsp; [![Build Status](https://travis-ci.org/acusti/affixing-header.svg?branch=master)](https://travis-ci.org/acusti/affixing-header)

Create an affixing header that behaves normally as a user navigates down a page, but reveals itself naturally when a user scrolls or drags upwards. Inspired by iOS Safari, Medium, and others. See an [example implementation][acusti.ca]. Works on desktop and mobile browsers.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/acusti.svg)](https://saucelabs.com/u/acusti)

## Usage

The object exports an `affixing-header` module if being used with a CommonJS or AMD module loader, or else exposes a global object as `window.affixingHeader`.

### `affixingHeader( element )`

#### `element` Element

The DOM element to which the affixing behaviour should be attached. Must be a single Element (e.g., the result of `document.querySelector` or `document.getElementById`), not a `NodeList`.

### Dependencies

This package uses [jank-free onscroll][], a requestAnimationFrame-based, performant, mobile-friendly scroll event handler, to listen for page scrolls, but has no other dependencies.

### Compatibility

The scroll handling uses `requestAnimationFrame`, which is [only available in IE10+][raf-caniuse]. For older browsers, your header won’t affix to the top of the page when you scroll up, but you shouldn’t see any other issues (yay progressive enhancement). To add full support for older browsers, just include a [requestAnimationFrame polyfill][raf-polyfill].

[acusti.ca]: http://www.acusti.ca
[jank-free onscroll]: https://github.com/acusti/jank-free-onscroll
[raf-caniuse]: http://caniuse.com/#feat=requestanimationframe
[raf-polyfill]: https://gist.github.com/paulirish/1579671
