// param
define("module:param", function() {
	var param = {
		id: "?",

		reg: "(?:[?](.*))?",
		
		parse: function(params) {
			params = params.split("&");
			var ret = {};

			params.forEach(function(keyValueStr) {
				keyValueStr = keyValueStr.split("=");

				ret[keyValueStr[0]] = decodeURIComponent(keyValueStr[1]);

			});

			return ret;
		},
		action: function(mod, params) {
			
			if(mod.exports.parse) {
				params = mod.exports.parse(params, param.parse/*标准*/);
			}
			// @if debug
			else {
				console.info("[module:param.action] moduleId: " + mod.id + " not implement the method 'parse'", mod);
			}
			// @endif
			
			
			
			var defaultMethod = mod.defaultMethod;
			var callMethod = mod.callMethod;

			var ret = null;

			if(callMethod && mod.exports[callMethod]) { // 如果是通过method扩展加载过来的
				
				ret = mod.exports[callMethod].apply(mod.exports, [].concat(params));

				mod.callMethod = null; // 调用方法之后把callMethod清掉

			} else if(defaultMethod && mod.exports[defaultMethod]){ // 调用默认指定的方法

				ret = mod.exports[defaultMethod].apply(mod.exports, [].concat(params));

			} else {

				console.warn("[module:param.action] moduleId: " + mod.id + " not set the attibute 'defaultMethod' and 'callMethod' ", mod); // @debug
				
				return;
			}
			
			return ret;
			
		}
	};
	return param;
});



