// sub-module
define("module:subModule", function(require) {
	var subModule = {
		id: "&",

		reg: "(?:[&]([\\w,]+))?",
		
		action: function(mod, subModuleIds) {
			// @if debug
			if(!mod.exports.register) {
				console.warn("[module:plugin.action] moduleId: " + mod.id + " not implement the method 'register'", mod);
				return;
			}
			// @endif
			if(!subModuleIds) {return;}

			!mod.subModule && (mod.subModule = {});

			subModuleIds = subModuleIds.split(",");
			
			subModuleIds.forEach(function (subModuleId) {
				
				if(!mod.subModule[subModuleId]) {
					
					var subm = require.getExports(mod.id + ":" + subModuleId);
					mod.exports.register(subModuleId, subm);
					
					mod.subModule[subModuleId] = 1;
				
				}

			});

		}
	};
	return subModule;
});



