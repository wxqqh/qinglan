define("EventManager:once", function(){
	var invocation = {
		emit: function(type /*, args */) {
			this.env.emit.apply(this.env, arguments);
			this.env.clear.apply(this.env, arguments);
		}
	};

	return invocation;
});
