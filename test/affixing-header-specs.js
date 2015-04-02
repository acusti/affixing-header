var webdriver      = require('selenium-webdriver'),
    Key            = webdriver.Key,
    controlFlow    = webdriver.promise.controlFlow(),
    chai           = require('chai'),
    expect         = chai.expect;

chai.use(require('chai-as-promised'));

var // headerHeight   = 150,
    headerClass    = 'affixing-header',
    browser,
    documentBody,
    interactionDelay = 150;

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

function setupDocument() {
	if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER) {
		browser = new webdriver.Builder()
		.usingServer('http://'+ process.env.SAUCE_USERNAME+':'+process.env.SAUCE_ACCESS_KEY+'@ondemand.saucelabs.com:80/wd/hub')
		.withCapabilities({
			'tunnel-identifier': process.env.TRAVIS_JOB_NUMBER,
			build: process.env.TRAVIS_BUILD_NUMBER,
			username: process.env.SAUCE_USERNAME,
			accessKey: process.env.SAUCE_ACCESS_KEY,
			browserName: 'chrome'
		}).build();
	} else {
		browser = new webdriver.Builder()
		.forBrowser('chrome')
		.build();
	}

	return browser.get('http://localhost:3000/test/index.html');
}

function pageUpDelayed() {
    documentBody.sendKeys(Key.PAGE_UP);
    return webdriver.promise.delayed(interactionDelay);
}

function pageDownDelayed() {
    documentBody.sendKeys(Key.PAGE_DOWN);
    return webdriver.promise.delayed(interactionDelay);
}

function scrollUpDelayed() {
    documentBody.sendKeys(Key.ARROW_UP);
    return webdriver.promise.delayed(interactionDelay);
}

function scrollDownDelayed() {
    documentBody.sendKeys(Key.ARROW_DOWN);
    return webdriver.promise.delayed(interactionDelay);
}

describe('affixing-header', function() {
    var header;

	beforeEach(function() {
		setupDocument();
        header = browser.findElement({className: headerClass});
        documentBody = browser.findElement({tagName: 'body'});
	});
    afterEach(function() {
        browser.quit();
    });

	it('keeps header at top of document.body (off screen) when user scrolls down', function() {
        expect(header.getCssValue('top')).to.eventually.equal('0px');
        expect(header.getCssValue('position')).to.eventually.equal('absolute');

        controlFlow.execute(pageDownDelayed);

        expect(header.getCssValue('top')).to.eventually.equal('0px');
        return expect(header.getCssValue('position')).to.eventually.equal('absolute');
	});

	it('adjusts header position to just above the viewport after 11 upward scroll events', function() {
        var scrollCount = 10;

        documentBody.sendKeys(Key.PAGE_DOWN + Key.PAGE_DOWN);

        expect(header.getCssValue('top')).to.eventually.equal('0px');
        expect(header.getCssValue('position')).to.eventually.equal('absolute');

        while (scrollCount--) {
            controlFlow.execute(scrollUpDelayed);
        }
        expect(header.getCssValue('top')).to.eventually.not.equal('0px');
        return expect(header.getCssValue('position')).to.eventually.equal('absolute');
	});

	it('adjusts header position to fixed when user scrolls back up the page far enough', function() {
        var scrollCount = 20;

        documentBody.sendKeys(Key.PAGE_DOWN + Key.PAGE_DOWN);

        expect(header.getCssValue('top')).to.eventually.equal('0px');
        expect(header.getCssValue('position')).to.eventually.equal('absolute');

        while (scrollCount--) {
            controlFlow.execute(scrollUpDelayed);
        }

        expect(header.getCssValue('top')).to.eventually.equal('0px');
        return expect(header.getCssValue('position')).to.eventually.equal('fixed');
	});

	it('allows header to disappear again when scrolling down', function() {
        documentBody.sendKeys(Key.PAGE_DOWN + Key.PAGE_DOWN);
        expect(header.getCssValue('top')).to.eventually.equal('0px');
        expect(header.getCssValue('position')).to.eventually.equal('absolute');
        // Scroll back up a bunch
        controlFlow.execute(pageUpDelayed);
        // Header should be affixed
        expect(header.getCssValue('top')).to.eventually.equal('0px');
        expect(header.getCssValue('position')).to.eventually.equal('fixed');

        controlFlow.execute(scrollDownDelayed);

        // Header should no longer be fixed
        expect(header.getCssValue('top')).to.eventually.not.equal('0px');
        // Or if that doesn't work, just test not.equal('0px');
        return expect(header.getCssValue('position')).to.eventually.equal('absolute');
	});
});
