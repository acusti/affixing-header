var webdriver      = require('selenium-webdriver'),
    Key            = webdriver.Key,
    controlFlow    = webdriver.promise.controlFlow(),
    chai           = require('chai'),
    expect         = chai.expect;

chai.use(require('chai-as-promised'));

var headerClass      = 'affixing-header',
    interactionDelay = 150;

function runTests(browserName) {
    var browser,
        documentBody;

    function setupDocument() {
        browserName = browserName || 'chrome';
    	if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER) {
    		browser = new webdriver.Builder()
    		.usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
    		.withCapabilities({
                'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
                build               : process.env.TRAVIS_BUILD_NUMBER,
                username            : process.env.SAUCE_USERNAME,
                accessKey           : process.env.SAUCE_ACCESS_KEY,
                browserName         : browserName,
                name                : 'Testing affixing-header',
                tags                : [process.env.TRAVIS_PULL_REQUEST, process.env.TRAVIS_BRANCH, 'CI']
    		}).build();
    	} else {
    		browser = new webdriver.Builder()
    		.forBrowser(browserName)
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
        this.timeout(40000);

    	before(function() {
    		return setupDocument();
        });

    	beforeEach(function() {
            header = browser.findElement({className: headerClass});
            documentBody = browser.findElement({tagName: 'body'});
    	});

        afterEach(function() {
            // Refresh browser, wait until it is reloaded
            browser.navigate().refresh();
            return browser.wait(webdriver.until.elementLocated({className: headerClass}));
        });

        after(function() {
            return browser.quit();
            // Resolve promise
            // deferred.resolve();
        });

    	it('keeps header at top of document.body (off screen) when user scrolls down', function() {
            expect(header.getCssValue('top')).to.eventually.equal('0px');
            expect(header.getCssValue('position')).to.eventually.equal('absolute');

            controlFlow.execute(pageDownDelayed);

            expect(header.getCssValue('top')).to.eventually.equal('0px');
            return expect(header.getCssValue('position')).to.eventually.equal('absolute');
    	});

    	it('adjusts header position to just above the viewport after 5 upward scroll events', function() {
            var scrollCount = 9;

            documentBody.sendKeys(Key.PAGE_DOWN);

            expect(header.getCssValue('top')).to.eventually.equal('0px');
            expect(header.getCssValue('position')).to.eventually.equal('absolute');

            while (scrollCount--) {
                controlFlow.execute(scrollUpDelayed);
            }
            expect(header.getCssValue('top')).to.eventually.not.equal('0px');
            return expect(header.getCssValue('position')).to.eventually.equal('absolute');
    	});

    	it('adjusts header position to fixed when user scrolls back up the page far enough', function() {
            var scrollCount = 22;

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
}

module.exports = runTests;