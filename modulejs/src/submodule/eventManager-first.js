define("EventManager:first", function(){
	var timer = {};
	var timeout = {};

	var TIMEOUT = 300;

	var invocation = {
		on: function(type, fun, time) {
			timeout[type] = time;
			this.on(type + "@first", fun);
		},
		emit: function(type /*, args */) {
			if(timer[type]) {return;}

			this.env.emit.apply(this.env, arguments); // 触发事件

			timer[type] = setTimeout(function() {
				timer[type] = null;
			}, timeout[type] || TIMEOUT);
		}
	};

	return invocation;
});

