// Test runner
var runTests  = require('./affixing-header-specs'),
    browsers  = [
        {name: 'chrome'},
        {name: 'firefox'}
    ];

// var browserConfig = require('./helpers/browser-config');

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push(
        {name: 'internet explorer'},
        {name: 'safari', version: 7}/*,
        {name: 'ipad', version: 8},
        {name: 'iphone', version: 8}*/
    );
}

browsers.forEach(function(browser) {
    runTests(browser);
});