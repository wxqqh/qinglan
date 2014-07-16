// method
define("module:method", function() {
	var method = {
		id: "@",

		reg: "(?:[@](\\w+))?",
		
		action: function(mod, method) {
			if(mod.exports.method) {
				mod.callMethod = method;
			}
		}
	};
	return method;
});


