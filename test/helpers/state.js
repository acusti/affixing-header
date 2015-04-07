var extend = require('util')._extend;

var initialTestState = {
	isFailing: false,
	isReported: false
};
var testState = extend({}, initialTestState);

var stateInterface = {
	update: function(state) {
		extend(testState, state);
	},
	reset: function() {
		testState = extend({}, initialTestState);
	},
	get: function(key) {
		return testState[key];
	}
};

module.exports = stateInterface;
