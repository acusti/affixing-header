var extend = require('extend');

var initialTestState = {
	isFailing: false,
	isReported: false,
	sauceSessionId: ''
};
var testState = extend({}, initialTestState);

var stateInterface = {
	update: function(state) {
		testState = extend(testState, state);
	},
	reset: function() {
		testState = extend(testState, initialTestState);
	},
	get: function(key) {
		return testState[key];
	}
};

module.exports = stateInterface;
