// Test runner
var runTests  = require('./affixing-header-specs'),
    browsers  = [
        {name: 'chrome'},
        {name: 'firefox'}
    ];

// var browserConfig = require('./helpers/browser-config');

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push(
        {browserName: 'safari', version: 7},
        {browserName: 'ipad', version: 8, appiumVersion: '1.3.7'},
        {browserName: 'iphone', version: 8, appiumVersion: '1.3.7'},
        {browserName: 'chrome', platformName: 'android', appiumVersion: '1.3.7'},
        {browserName: 'internet explorer'}
	);
}

browsers.forEach(function(browser) {
    runTests(browser);
});
