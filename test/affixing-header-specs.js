var webdriver      = require('selenium-webdriver'),
    chai           = require('chai'),
    expect         = chai.expect;

chai.use(require('chai-as-promised'));

require('colors');

// TODO:
// ✓ Convert tests to using JS (http://www.tysoncadenhead.com/blog/executeasyncscript-in-selenium-webdriver-for-node#.VR6C9Odkt6k)
// Figure out best way to bundle module for distribution

function runTests(browser) {
    var driver;

    function setupDocument() {
        browser.name = browser.name || 'chrome';
    	if (process.env.SAUCE_USERNAME && process.env.TRAVIS_JOB_NUMBER) {
            var tags = ['CI', browser.name],
                capabilities;
            if (process.env.TRAVIS_PULL_REQUEST) {
                tags.push(process.env.TRAVIS_PULL_REQUEST);
            }
            if (process.env.TRAVIS_BRANCH) {
                tags.push(process.env.TRAVIS_BRANCH);
            }
            capabilities = {
                'tunnel-identifier' : process.env.TRAVIS_JOB_NUMBER,
                build               : process.env.TRAVIS_BUILD_NUMBER,
                username            : process.env.SAUCE_USERNAME,
                accessKey           : process.env.SAUCE_ACCESS_KEY,
                browserName         : browser.name,
                name                : 'Testing affixing-header',
                tags                : tags
            };
            if (browser.version) {
                capabilities.version = browser.version;
            }
    		driver = new webdriver.Builder()
    		.usingServer('http://' + process.env.SAUCE_USERNAME + ':' + process.env.SAUCE_ACCESS_KEY + '@ondemand.saucelabs.com:80/wd/hub')
    		.withCapabilities(capabilities).build();
            driver.getSession().then(function (session) {
                process.env.SAUCE_SESSION_ID = session.getId();
            });
    	} else {
    		driver = new webdriver.Builder()
    		.forBrowser(browser.name)
    		.build();
    	}
        console.log(('\n  Running tests for ' + browser.name).cyan);
    	return driver.get('http://localhost:3000/test/index.html');
    }

    // Returns a function to pass to executeAsyncScript; returns an object to the promise callback with position and top css of the header element
    function scrollTo() {
        return function(scrollY) {
            var callback     = arguments[arguments.length - 1],
                requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame,
                header       = document.querySelector('.affixing-header');

            // Scroll page
            window.scrollTo(0, scrollY);
            // Create scroll event
            var scrollEvt = document.createEvent('Event');
            // Define that the event name is 'scroll'.
            scrollEvt.initEvent('scroll', true, true);
            // Dispatch event using document
            document.dispatchEvent(scrollEvt);
            // Use requestAnimationFrame to call callback
            requestFrame(function() {
                window.setTimeout(function() {
                    callback({
                        position: header.style.position,
                        top: header.style.top
                    });
                }, 1);
            });
        };
    }

    describe('affixing-header', function() {
        var pageHeight;
        this.timeout(40000);

    	before(function() {
    		return setupDocument();
        });

    	beforeEach(function() {
            return driver.executeAsyncScript(function() {
                arguments[arguments.length - 1](document.documentElement.scrollHeight);
            }).then(function(scrollHeight) {
                pageHeight = scrollHeight;
            });
    	});

        afterEach(function() {
            // Reset position and refresh browser, wait until it is reloaded
            driver.manage().timeouts().setScriptTimeout(2000, 1);
            driver.executeAsyncScript(scrollTo(), 0).then(function() {
                driver.navigate().refresh();
            });
            driver.manage().timeouts().implicitlyWait(6000, 1);
            return driver.wait(webdriver.until.elementLocated({className: 'is-ready'}));
        });

        after(function() {
            return driver.quit();
            // Resolve promise
            // deferred.resolve();
        });

    	it('keeps header at top of document.body (off screen) when user scrolls down', function() {
            var header = driver.findElement({className: 'affixing-header'});
            expect(header.getCssValue('top')).to.eventually.equal('0px');
            expect(header.getCssValue('position')).to.eventually.equal('absolute');

            driver.manage().timeouts().setScriptTimeout(2000, 1);
            return driver.executeAsyncScript(scrollTo(), Math.round(pageHeight / 2)).then(function(computedStyles) {
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });
    	});

    	it('adjusts header position with bottom at the top of the viewport after “intentional” upward scrolling', function() {
            var scrollCount = 8,
                scrollY     = Math.round(pageHeight / 2);

            driver.manage().timeouts().setScriptTimeout(2000, 1 + scrollCount + 1);
            driver.executeAsyncScript(scrollTo(), scrollY).then(function(computedStyles) {
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });

            while (scrollCount--) {
                scrollY -= 4;
                driver.executeAsyncScript(scrollTo(), scrollY);
            }
            return driver.executeAsyncScript(scrollTo(), scrollY - 2).then(function(computedStyles) {
                // TODO: should this be more specific?
                expect(computedStyles.top).to.not.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });
    	});

    	it('adjusts header position to fixed when user scrolls back up the page far enough', function() {
            var scrollCount = 14,
                scrollY     = Math.round(pageHeight / 2),
                scrollDelta = Math.round(scrollY / (scrollCount + 4));

            driver.manage().timeouts().setScriptTimeout(2000, 1 + scrollCount + 1);
            driver.executeAsyncScript(scrollTo(), scrollY).then(function(computedStyles) {
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });

            while (scrollCount--) {
                scrollY -= scrollDelta;
                driver.executeAsyncScript(scrollTo(), scrollY);
            }
            return driver.executeAsyncScript(scrollTo(), scrollY - scrollDelta).then(function(computedStyles) {
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('fixed');
            });
    	});

    	it('allows header to disappear again when scrolling down', function() {
            var scrollY = Math.round(pageHeight / 2);

            driver.manage().timeouts().setScriptTimeout(2000, 4);
            driver.executeAsyncScript(scrollTo(), scrollY).then(function(computedStyles) {
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });

            // Scroll back up a bunch
            scrollY -= Math.round(pageHeight / 8);
            driver.executeAsyncScript(scrollTo(), scrollY).then(function() {});
            scrollY -= Math.round(pageHeight / 8);
            driver.executeAsyncScript(scrollTo(), scrollY).then(function(computedStyles) {
                // Header should be affixed
                expect(computedStyles.top).to.equal('0px');
                expect(computedStyles.position).to.equal('fixed');
            });

            return driver.executeAsyncScript(scrollTo(), scrollY + 5).then(function(computedStyles) {
                // Header should no longer be fixed
                expect(computedStyles.top).to.not.equal('0px');
                expect(computedStyles.position).to.equal('absolute');
            });
    	});
    });
}

module.exports = runTests;
