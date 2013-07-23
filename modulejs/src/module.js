;(function (global) {
	var modules = {},
		def = ["require", "exports", "module"],
		is = function(type, obj){
			return Object.prototype.toString.call(obj).slice(8, -1) === type;
		},
		swap = function(a, o){
			Object.keys(o).forEach(function (k) {
				var v = o[k],
					i = a.indexOf(k);
				(i > -1) && (a[i] = v);
			})
			return a;
		},
		module = function(id, deps, factory) {
			this.id = id;
			this.deps = deps || [];
			this.factory = factory;
			this.exports = null;
		},
		getExports = function(id){
			var factory, deps, exports, defDep, depList = {}, m = modules[id], duration = 0;

			if(id.indexOf('!') > -1) { // 加载同步插件
				return getPlugin(id);
			}

			if(!m) return null;
			if(m.exports) return m.exports;

			factory = m.factory,
			deps = m.deps.concat(def),
			defDep ={
				'require': require,
				'module': m,
				'exports': (m.exports = {})
			};

			if(is('Function', factory)){
				deps.forEach(function (dep) {
					depList[dep] = def.indexOf(dep) > -1 ? defDep[dep] : getExports(dep);
				});
				duration = Date.now(); // @debug
				exports = factory.apply(m, factory.length ? swap(deps, depList) : []);
				duration = Date.now() - duration; // @debug
			} else {
				exports = factory;
			}

			m.exports = exports || m.exports;
			console.log('module getExports id : ' + id + ' duration : ' + duration); // @debug
			return m.exports;
		},
		getPlugin = function(id) {
			var parts = id.split('!'), pluginId = parts[0] || '', plugSource = parts[1] || '', plugin, m = modules[id], duration = 0, load, definition;
			
			if(m && m.exports) { 
				return m.exports; //如果这个资源ID已经被初始化过，则直接返回
			} else if(plugSource) {
				m = new module(id); // 初始化资源模块
				duration = Date.now(); // @debug
				plugin = getExports(pluginId); // 获取插件
				if(plugin) {
					load = function (definition) { // 插件加载完毕
						m.exports = definition || {};
						modules[id] = m; // 覆盖pluginModule
					};
					plugin.normalize && (plugSource = plugin.normalize(plugSource)); // 如果模块定义了normalize方法，则调用它，得到标准化之后的plugSource
					plugin.load &&  (definition = plugin.load(plugSource, require, load, define.plugin)); // 执行模块定义的load方法，所有插件加载模块都必须实现的load方法
					!m.exports && load(definition); // 如果module的exports没有被赋值，则把load方法的返回值覆盖
					duration = Date.now() - duration; // @debug
					console.log('module getPlugin id : ' + id + ' duration : ' + duration); // @debug
					return m.exports; // 返回插件模块加载好的模块
				} else {
					return null;
				}
			}
		},
		define = function(id, deps, factory) { // 模块定义必须要有id
			var m;
			factory == void 0 && (factory=deps, deps= null); // 如果factory是undefined，则覆盖factory，deps置空
			deps = deps ? [].concat(deps) : [];
			m = new module(id, deps, factory);
			modules[id] = m;
			console.log('module define id : ' + id); // @debug
			return id;
		},
		require = function(ids, fn) {
			var fnArgs, reqs = {},
			ids = [].concat(ids),
			len = ids.length;

			ids.forEach(function(id){
			 	reqs[id] = getExports(id);
			});

			is('Function', fn) && fn.apply(null, len ? swap(ids , reqs) : []);

			return len == 1 ? reqs[ids[0]] : reqs;
		};

	define.plugin = {};

	require.async = function(ids, fn){
			setTimeout(function() { require(ids, fn) }, 0);
		};

	global.modules = modules,
	global.require = require,
	global.define = define;
})(window);
