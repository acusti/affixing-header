// Test runner
var runTests  = require('./affixing-header-specs'),
    browsers  = [
        {browserName: 'chrome'},
        {browserName: 'firefox'}
    ];

// var browserConfig = require('./helpers/browser-config');

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push(
        {browserName: 'safari', version: '7'},
        {browserName: 'safari', deviceName: 'iPad 2',           platformVersion: '8.3', platformName: 'iOS', appiumVersion: '1.3.7'},
        {browserName: 'safari', deviceName: 'iPhone 6',         platformVersion: '8.3', platformName: 'iOS', appiumVersion: '1.3.7'},
        {browserName: 'chrome', deviceName: 'Android Emulator', platformVersion: '4.3', platformName: 'Android', appiumVersion: '1.3.7'},
        {browserName: 'internet explorer'}
	);
}

browsers.forEach(function(browser) {
    runTests(browser);
});
