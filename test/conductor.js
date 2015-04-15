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
        {browserName: 'safari', deviceName: 'iPhone Simulator', platformVersion: '7.1', platformName: 'iOS', appiumVersion: '1.3.7'},
        {browserName: 'safari', deviceName: 'iPad Simulator',   platformVersion: '7.1', platformName: 'iOS', appiumVersion: '1.3.7'},
        {browserName: 'chrome', deviceName: 'Android Emulator', platformVersion: '4.3', platformName: 'Android', appiumVersion: '1.3.7'},
        {browserName: 'internet explorer'}
	);
}

browsers.forEach(function(browser) {
    runTests(browser);
});
