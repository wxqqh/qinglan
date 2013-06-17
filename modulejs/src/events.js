defined('events', function (require, exports, module) {
	var eventEmitter = function(){
		this.listeners = {};
	};
	
	eventEmitter.prototype = {
		on : function(type, fn) {
			!this.listeners[type] && (this.listeners[type] = []);
			this.listeners[type].push(fn);
		},
		clear: function(type) {
			this.listeners[type] && (this.listeners[type] = []);
		},
		emit: function(type /*,args*/){
			!this.listeners[type] && (this.listeners[type] = []);
			var list = this.listeners[type],
				len = list.length,
				args = Array.prototype.slice.call(arguments, 1);
			list.forEach(function(fn){
				fn.apply(null, args);
			})
		}
	};

	exports.eventEmitter = eventEmitter;
});
