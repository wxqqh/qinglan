// extLoader
define("module:extLoader", function(require) {
	// 插件扩展, 这个直接扩展require接口
	require.reg = null;

	require.plugins = [];
	
	require.addPlugin = function(plugin) {
		
		require.plugins.push(plugin);
		
		var reg = ["^([\\w:]+)"]; // moduleId
		require.plugins.forEach(function(plugin) {
			reg.push(plugin.reg);
		});
		
		require.reg = new RegExp(reg.join(""));

	};

	require.extLoader = function(id) {
		if(require.reg) {
			var match = require.reg.exec(id);
			
			if(null !== match && match.length > 1) { // match 之后index为0的是整个字串, 从1开始是分组
				var moduleId = match[1];
				var m = require.getExports(moduleId); // 第一个分组是 moduleid

				for (var i = 2; i < match.length; i++) { // 从第二个开始是扩展加载的正则捕获组
					var value = match[i];
					if(value) {
						var plugin = require.plugins[i-2]; // 获取当前作用plugin
						var ret = plugin.action(require.modules[moduleId], value);
						if(ret) {return ret;} // 如果插件加载有返回值, 则把返回值返回出去
					}
				}

				return m;

			} else { // 加载出错
				return null;
			}
		} else {
			return require.getExports(id);
		}
	}
	
});


