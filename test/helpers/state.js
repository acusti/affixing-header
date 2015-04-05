var extend = require('util')._extend;

var initialTestState = {
	isFailing: false,

};
var testState = extend({}, initialTestState);

testState.update = function(state) {
	extend(testState, state);
};

testState.reset = function() {
	testState = extend({}, initialTestState);
};

module.exports = testState;
