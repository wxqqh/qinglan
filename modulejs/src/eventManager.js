define("EventManager", function() {
	var EventEmitter = require("events").eventEmitter;
	
	var manager = {
		env: new EventEmitter(),
		subModule	: {},
		on: function() {
			this.env.on.apply(this.env, arguments);
		},
		emit: function(type /* args */) {
			console.group("EventManager#emit type : %s ", type); // @debug
			var interceptor, eventType;
			if(type.indexOf("@") > -1) { // 如果是触发扩展事件
				var temp = type.split("@");

				eventType = temp[0];
				interceptor = temp[1];
				
				if(this.subModule[interceptor]) {
					console.time("EventManager#emit invoke : " + interceptor); // @debu
					this.subModule[interceptor].apply(this, arguments);
					console.timeEnd("EventManager#emit invoke : " + interceptor); // @debug
				} else {
					console.warn("EventManager#emit interceptor : %s had not defined!", interceptor); // @debug
				}

			} else { // 直接触发事件
			
				for(interceptor in this.subModule) { // 触发所有类型的interceptor
					var invocation = this.subModule[interceptor];
					console.time("EventManager#emit invoke : " + interceptor); // @debug
					
					var args = Array.prototype.slice.call(arguments, 1);
					eventType = type + "@" + interceptor; // 覆盖type
					
					args.unshift(eventType);

					invocation.apply(this, args);
					console.timeEnd("EventManager#emit invoke : " + interceptor); // @debug
				}
				console.time("EventManager#emit emit : " + type); // @debug
				this.env.emit.apply(this.env, arguments);
				console.timeEnd("EventManager#emit emit : " + type); // @debug
			}
			console.groupEnd(); // @debug
		},
		register: function(interceptor /* subModuleID */, invocation /* subModule */) {
			if(!this[interceptor]) {
				this[interceptor] = invocation.on || function(type, fn) {
					this.on(type + "@" + interceptor, fn);
				};
				this.subModule[interceptor] = invocation.emit;

			} else {
				console.warn("EventManager#add interceptor : %s had been defined!", interceptor, this.subModule[interceptor]);
			}
		}
	};
	return manager;
});
