var webdriver      = require('selenium-webdriver'),
    Key            = webdriver.Key,
    controlFlow    = webdriver.promise.controlFlow(),
    chai           = require('chai'),
    expect         = chai.expect;

chai.use(require('chai-as-promised'));

require('colors');

var headerClass      = 'affixing-header',
    interactionDelay = 200;

function runTests(browserName) {
    var browser,
        documentBody;

    function setupDocument() {
        browserName = browserName || 'chrome';
    	if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER) {
            var tags = ['CI', browserName];
            if (process.env.TRAVIS_PULL_REQUEST) {
                tags.push(process.env.TRAVIS_PULL_REQUEST);
            }
            if (process.env.TRAVIS_BRANCH) {
                tags.push(process.env.TRAVIS_BRANCH);
            }
    		browser = new webdriver.Builder()
    		.usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
    		.withCapabilities({
                'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
                build               : process.env.TRAVIS_BUILD_NUMBER,
                username            : process.env.SAUCE_USERNAME,
                accessKey           : process.env.SAUCE_ACCESS_KEY,
                browserName         : browserName,
                name                : 'Testing affixing-header',
                tags                : tags
    		}).build();
    	} else {
    		browser = new webdriver.Builder()
    		.forBrowser(browserName)
    		.build();
    	}
        console.log(('\n  Running tests for ' + browserName).cyan);
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
            // Reset position and refresh browser, wait until it is reloaded
            documentBody.sendKeys(Key.HOME);
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
            var scrollCount = 6;
            // Bah! Chrome (maybe also safari) is weird and needs a lot of up arrows to reveal the header
            if (browserName === 'chrome' || browserName === 'safari') {
                scrollCount = 11;
            }

            controlFlow.execute(pageDownDelayed);
            controlFlow.execute(pageDownDelayed);

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

            controlFlow.execute(pageDownDelayed);
            controlFlow.execute(pageDownDelayed);

            expect(header.getCssValue('top')).to.eventually.equal('0px');
            expect(header.getCssValue('position')).to.eventually.equal('absolute');

            while (scrollCount--) {
                controlFlow.execute(scrollUpDelayed);
            }

            expect(header.getCssValue('top')).to.eventually.equal('0px');
            return expect(header.getCssValue('position')).to.eventually.equal('fixed');
    	});

    	it('allows header to disappear again when scrolling down', function() {
            var scrollCount = 20;

            controlFlow.execute(pageDownDelayed);
            controlFlow.execute(pageDownDelayed);

            expect(header.getCssValue('top')).to.eventually.equal('0px');
            expect(header.getCssValue('position')).to.eventually.equal('absolute');
            // Scroll back up a bunch
            // TODO: using pageUp doesn't reveal menu in firefox
            // controlFlow.execute(pageUpDelayed);
            // controlFlow.execute(scrollUpDelayed);
            while (scrollCount--) {
                controlFlow.execute(scrollUpDelayed);
            }

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
