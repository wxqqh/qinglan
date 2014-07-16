// param
define("module:param", function() {
	var param = {
		id: "?",

		reg: "(?:[?](.*))?",
		
		action: function(mod, param) {
			// @if debug
			if(!mod.exports.parse) {
				console.warn("[module:plugin.action] moduleId: " + mod.id + " not implement the method 'parse'", mod);
				return;
			}
			// @endif
			
			if(!param) {return;}



			
		}
	};
	return param;
});



