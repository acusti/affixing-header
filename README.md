# Affixing Header&nbsp; [![Build Status](https://travis-ci.org/acusti/affixing-header.svg?branch=master)](https://travis-ci.org/acusti/affixing-header)

Create an affixing header that behaves normally as a user navigates down a page, but reveals itself naturally when a user scrolls or drags upwards. Inspired by iOS Safari, Medium, and others. See [an example implementation][acusti.ca] to see what it’s about. Works on desktop and mobile browsers.

[![Sauce Test Status](https://saucelabs.com/browser-matrix/acusti.svg)](https://saucelabs.com/u/acusti)

## Usage

The module itself is available in a wide range of flavors:

1. As a CommonJS (Browserify-friendly) module (via [UMD]): `dist/affixing-header.js`
2. As an AMD (RequireJS-friendly) module (also via UMD): `dist/affixing-header.js`
3. As the `window.affixingHeader` global with dependencies bundled in: `dist/affixing-header-bundled.js`, or minified as `dist/affixing-header-bundled-min.js`
4. As an ES6/ES2015 module, compatible with ES6-compatible module loaders like [SystemJS][] or compilers like [Babel][]: `src/affixing-header.js`

It exports an `affixing-header` function if being used with a CommonJS or AMD module loader, or else exposes the function as a global named `window.affixingHeader`.

### `affixingHeader( element )`

#### `element` Element

The DOM element to which the affixing behaviour should be attached. Must be a single Element (e.g., the result of `document.querySelector` or `document.getElementById`), not a `NodeList`.

### Dependencies

This package uses [onscrolling][], a requestAnimationFrame-based, performant, mobile-friendly scroll event handler, to listen for page scrolls, but has no other dependencies.

### Compatibility

The scroll handling uses `requestAnimationFrame`, which is [only available in IE10+][raf-caniuse]. For older browsers, your header won’t affix to the top of the page when you scroll up, but you shouldn’t see any other issues (yay progressive enhancement). To add full support for older browsers, just include a [requestAnimationFrame polyfill][raf-polyfill].

[acusti.ca]: http://www.acusti.ca
[UMD]: https://github.com/umdjs/umd
[SystemJS]: https://github.com/systemjs/systemjs
[Babel]: https://babeljs.io
[onscrolling]: https://github.com/acusti/onscrolling
[raf-caniuse]: http://caniuse.com/#feat=requestanimationframe
[raf-polyfill]: https://gist.github.com/paulirish/1579671
