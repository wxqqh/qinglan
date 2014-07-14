define("EventManager:delay", function(){
	var timer = {};
	var timeout = {};

	var TIMEOUT = 300;

	var invocation = {
		on: function(type, fun, time) {
			timeout[type] = time;
			this.on(type + "@delay", fun);
		},
		emit: function(type /*, args */) {
			var self = this;
			
			if(timer[type]) {
				timer[type] = clearTimeout(timer[type]);
				timer[type] = null;
			}
			
			var args = arguments;

			timer[type] = setTimeout(function() {

				self.env.emit.apply(self.env, args); // 触发事件

			}, timeout[type] || TIMEOUT);
		}
	};

	return invocation;
});


