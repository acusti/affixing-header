// BEGIN - Static server for test html
var finalhandler = require('finalhandler'),
    http         = require('http'),
    serveStatic  = require('serve-static');

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

// Test runner
var runTests = require('./affixing-header-specs'),
    browsers = ['chrome', 'firefox'];

if (process.env.TRAVIS_JOB_NUMBER) {
	browsers.push('internet explorer', 'ipad', 'iphone');
}

browsers.forEach(runTests);
