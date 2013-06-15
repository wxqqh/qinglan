defined('a', function(require, exports, module){
	var msg = 'module a';

	exports.msg = msg;
	
	exports.show = function () {
		var b = require('b');
		console.log(msg);
		b.show();
	}
});

defined('b', function(require, exports, module){
	var msg = 'module b';

	exports.msg = msg;
	
	exports.show = function () {
		console.log(msg);
	}
});

defined('c', ['a', 'b'], function(a, b, require, exports, module){
	var msg = 'module c';
	console.log(msg);
	a.show();

	var _c = require('c');

	exports.msg = msg;
	
	exports.show = function () {
		console.log(msg);
	}

	console.log('_c ' + _c.msg);
});
