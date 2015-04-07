// BEGIN - Static server for test html
var finalhandler = require('finalhandler'),
    http         = require('http'),
    serveStatic  = require('serve-static'),
    Mocha        = require('mocha'),
    Saucelabs    = require('saucelabs'),
    testState    = require('./helpers/state');

require('colors');

// Serve up project root
var serve = serveStatic('./');

// Create server
var server = http.createServer(function(req, res) {
    var done = finalhandler(req, res);
    serve(req, res, done);
});

// Listen
server.listen(3000);
// END - Static server

function reportTestDetails(done) {
    if (testState.get('isReported')) {
        return;
    }
    if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER && testState.get('sauceSessionId')) {
        var sauce = new Saucelabs({
            username: process.env.SAUCE_USERNAME,
            password: process.env.SAUCE_ACCESS_KEY
        });
        console.log(('  Test suite reported as ' + (testState.get('isFailing') ? 'failed' : 'passed\n')).yellow);
        sauce.updateJob(testState.get('sauceSessionId'), {passed: !testState.get('isFailing')}, function () {
            done();
        });
    }
    testState.update({isReported: true});
}

var mocha = new Mocha({
    ui: 'bdd',
    reporter: 'spec'
});
mocha.addFile('test/conductor.js');

// browserConfig.set(browsers.shift());
var runner = mocha.run(function(failures) {
    process.exit(failures);
});
runner.on('fail', function() {
    testState.update({isFailing: true});
    reportTestDetails();
});
runner.on('suite', function() {
    testState.reset();
});
runner.on('suite end', function(done) {
    reportTestDetails(done);
});

// browsers.forEach(function(browser) {
//     browserConfig.set(browser);
//     // Start up Mocha
//     var runner   = mocha.run(),
//         isFailed = false;
//     runner.on('fail', function() {
//         isFailed = true;
//     });
//     runner.on('end', function() {
//         if (process.env.SAUCE_USERNAME && process.env.SAUCE_SESSION_ID && process.env.TRAVIS_JOB_NUMBER) {
//             var sauce = new Saucelabs({
//                 username: process.env.SAUCE_USERNAME,
//                 password: process.env.SAUCE_ACCESS_KEY
//             });
//             sauce.updateJob(process.env.SAUCE_SESSION_ID, {passed: !isFailed}, function () {});
//         }
//     });
//
//     // runTests(browser);
// });
