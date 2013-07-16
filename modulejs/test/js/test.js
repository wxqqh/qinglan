define('a', function(require, exports, module){
	var msg = 'module a';

	exports.msg = msg;
	
	exports.show = function () {
		var b = require('b');
		console.log(msg);
		b.show();
	}
});

define('b', function(require, exports, module){
	var msg = 'module b';

	exports.msg = msg;
	
	exports.show = function () {
		console.log(msg);
	}
});

define('c', ['a', 'b'], function(a, b, require, exports, module){
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


define('d', 'c', function(c){
	var msg = 'module d';
	console.log(msg);
	c.show();
	return {
		msg: msg,
		show: function(){
			console.log(msg);
		}
	}
});

define('e',function (require, exports, module) {
	var eventEmitter = require('events').eventEmitter;
	module.exports = new eventEmitter();
});


define('f',function (require, exports, module) {
	var f = {};
	f.msg = 'module f';
	f.show = function(){
			console.log(msg);
	}
	return f;	
});
