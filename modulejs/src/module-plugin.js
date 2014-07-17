// plugins
define("module:plugin", function() {
	var plugin = {
		id: "!",

		reg: "(?:[!]([/\\w:,]+))?",
		
		load: function(plugins, definition) { // 这个load方法只是简单的定义这样一个方法, 让插件加载完资源之后定义一个模块加入到cache中
			define(plugins, definition);
		},

		config: {},
		action: function(mod, plugins) {
			// @if debug
			if(!mod.exports.load) {
				console.warn("[module:plugin.action] moduleId: " + mod.id + " not implement the method 'load'", mod);
				return;
			}
			
			if(!plugins) {return;}
			// @endif
			
			mod.exports.normalize && (plugins = mod.exports.normalize(plugins)); // 插件实现normalize方法, 把plugins的路径标准化, 但是对于全同步的modules来说, 这个方法没什么意义 

			// 插件加载方法
			var load = function(definition) {
				plugin.load(plugins, definition);
				plugins = null;
			};

			return mod.exports.load(plugins, require, load, plugin.config); // see https://github.com/amdjs/amdjs-api/blob/master/LoaderPlugins.md#api-specification
		}
	};
	return plugin;
});

