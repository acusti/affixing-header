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

var isSauceRequestQueued = false,
    sauceCallbackQueue   = [];

function sauceCallbackConductor() {
    sauceCallbackQueue.forEach(function(callback) {
        callback();
    });
    sauceCallbackQueue = [];
    isSauceRequestQueued = false;
}

function reportTestDetails() {
    if (testState.get('isReported')) {
        return;
    }
    if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER && testState.get('sauceSessionId')) {
        var sauce = new Saucelabs({
            username: process.env.SAUCE_USERNAME,
            password: process.env.SAUCE_ACCESS_KEY
        });
        sauce.updateJob(testState.get('sauceSessionId'), {passed: !testState.get('isFailing')}, sauceCallbackConductor);
        isSauceRequestQueued = true;
        console.log(('  Test suite reported as ' + (testState.get('isFailing') ? 'failed' : 'passed\n')).yellow);
    }
    testState.update({isReported: true});
}
var mocha = new Mocha({
    ui: 'bdd',
    reporter: 'spec'
});
mocha.addFile('test/conductor.js');

// browserConfig.set(browsers.shift());

testState.update({testUrl: 'http://127.0.0.1:3000/test/index.html'});

var runner = mocha.run(function(failures) {
    if (isSauceRequestQueued) {
        sauceCallbackQueue.push(function() {
            process.exit(failures);
        });
    } else {
        process.exit(failures);
    }
});
runner.on('fail', function() {
    testState.update({isFailing: true});
    reportTestDetails();
});
runner.on('suite', function() {
    testState.reset();
});
runner.on('suite end', function() {
    reportTestDetails();
});
