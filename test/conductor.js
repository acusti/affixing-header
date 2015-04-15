// Test runner
var runTests  = require('./affixing-header-specs'),
    browsers  = [
        {browserName: 'chrome'},
        {browserName: 'firefox'}
    ];

// var browserConfig = require('./helpers/browser-config');

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push(
        {browserName: 'safari', version: 7},
        {browserName: 'ipad',   version: '7.1.2', appiumVersion: '1.3.7'},
        {browserName: 'iphone', version: '7.1.2', appiumVersion: '1.3.7'},
        {browserName: 'chrome', platformVersion: '4.2', platformName: 'Android', appiumVersion: '1.3.7', deviceName: 'Android Emulator'},
        {browserName: 'internet explorer'}
	);
}

browsers.forEach(function(browser) {
    runTests(browser);
});
