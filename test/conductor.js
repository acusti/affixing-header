// Test runner
var runTests  = require('./affixing-header-specs'),
    browsers  = [
        {browserName: 'chrome'},
        {browserName: 'firefox'}
    ];

// var browserConfig = require('./helpers/browser-config');

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push(
        {browserName: 'Safari',  version: '7'},
        {browserName: 'Safari',  deviceName: 'iPhone Simulator', platformName: 'iOS',   platformVersion: '8.2',     appiumVersion: '1.3.7'},
        {browserName: 'Safari',  deviceName: 'iPad Simulator',   platformName: 'iOS',   platformVersion: '8.2',     appiumVersion: '1.3.7'},
        {browserName: 'Android', deviceName: 'Android Emulator', platform:     'Linux', version:         '5.1'},
        {browserName: 'internet explorer'}
	);
}

browsers.forEach(function(browser) {
    runTests(browser);
});
