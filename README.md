# Affixing Header&nbsp; [![build workflow](https://github.com/acusti/affixing-header/actions/workflows/deploy.yml/badge.svg)](https://github.com/acusti/affixing-header/actions)

Create an affixing header that behaves normally as a user navigates down a page, but reveals itself naturally when a user scrolls or drags upwards. Inspired by iOS Safari, Medium, and others. See [an example implementation][acusti.ca] to see what it’s about. Works on desktop and mobile browsers.

## Usage

The module is ESM-only and exports a single default `affixingHeader` function:

### `affixingHeader( element, options )`

#### `element` HTMLElement

The DOM element to which the affixing behavior should be attached. Must be a single `HTMLElement` (e.g., the result of `document.querySelector` or `document.getElementById`), not a `NodeList`.

#### `options` object `{ useSticky?: boolean }`

Optional options for customizing the behavior of the affixing header. Passing `{ useSticky: true }` will cause the module to use `position: sticky` (instead of `position: fixed`) when affixing the header on scrolling up.

### affixingHeader return value

#### `affixingHeader` function `(element: HTMLElement) => () => void`

The `affixingHeader` function returns a cleanup function that takes no arguments and is used to remove listeners and cleanup the affixing behavior.

## Dependencies

This package uses [onscrolling][], a requestAnimationFrame-based, performant, mobile-friendly scroll event handler, to listen for page scrolls, but has no other dependencies.

## Compatibility

This module is ESM-only and takes advantage of modern JS language features. It includes code to ensure it won’t throw errors in non-browser environments (e.g. node, workersd, deno, bun, etc.), where it will not do anything but also won’t break SSR. To make it compatible with non-ESM environments and older browsers, it must be transpiled.

## Tests

Tests use vitest + happy-dom and can be run with `yarn test`.

[acusti.ca]: http://www.acusti.ca
[onscrolling]: https://github.com/acusti/onscrolling
