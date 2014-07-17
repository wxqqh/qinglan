// method
define("module:method", function() {
	var method = {
		id: "@",

		reg: "(?:[@](\\w+))?",
		
		action: function(mod, method) {
			// @if debug
			if(!method) {return;}
			// @endif
			
			mod.callMethod = method;
		}
	};
	return method;
});


