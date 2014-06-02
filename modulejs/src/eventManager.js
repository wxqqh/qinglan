define("EventManager", function() {
	var EventEmitter = require("events").eventEmitter;
	
	var manager = {
		env: new EventEmitter(),
		invocations: {},
		on: function() {
			this.env.on.apply(this.env, arguments);
		},
		emit: function(type /* args */) {
			var interceptor;
			if(type.indexOf("@") > -1) { // 如果是触发扩展事件
				var temp = type.split("@");
				type = temp[0];
				interceptor = temp[1];
				
				if(this.invocations[interceptor]) {
					this.invocations[interceptor].apply(this, arguments);
				} else {
					console.warn("EventManager#emit interceptor : %s had not defined!", interceptor); // @debug
				}

			} else { // 直接触发事件
				console.group();
				for(interceptor in this.invocations) { // 触发所有类型的interceptor
					var invocation = this.invocations[interceptor];
					console.info("EventManager#emit invoke : %s ", interceptor); // @debug
					console.time("EventManager#emit invoke : %s ", interceptor); // @debug
					invocation.apply(this, arguments);
					console.timeEnd("EventManager#emit invoke : %s ", interceptor); // @debug
				}
				console.time("EventManager#emit emit : %s ", type); // @debug
				this.env.emit.apply(this.env, arguments);
				console.time("EventManager#emit emit : %s ", type); // @debug
				console.groupEnd();
			}
		},
		add: function(interceptor, invocation) {
			if(!this[interceptor]) {
				this[interceptor] = function(type, fn) {
					this.on(type + "@" + interceptor, fn);
				};
				this.invocations[interceptor] = invocation;

			} else {
				console.warn("EventManager#add interceptor : %s had been defined!", interceptor, this.invocations[interceptor]);
			}
		}
	};

});
