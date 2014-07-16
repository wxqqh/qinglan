;(function (global) {
	var modules = {},
		Module = function(id, deps, factory) {
			this.id = id;
			this.deps = deps || [];
			this.factory = factory;
			this.exports = null;
		},
		getExports = function(id){
			var m = modules[id]; 
			
			if(!m) {return null;}
			if(m.exports) {return m.exports;}

			var duration = Date.now(); // @debug

			if("function" == typeof m.factory) { // 如果factory是一个Function, 则需要获取依赖然后执行
				var reqs = [];
				
				m.exports = {};

				m.deps.forEach(function (dep) {
					reqs.push(getExports(dep));
				});

				reqs = reqs.concat(require/* require */, (m.exports = {})/* exports */, m /* module */);
			
				var exports = m.factory.apply(m, reqs);
				
				m.exports = exports || m.exports;

			} else { // 是一个值
				m.exports = m.factory;
			}

			duration = Date.now() - duration; // @debug
			console.log('module getExports id : ' + id + ' duration : ' + duration); // @debug
			
			return m.exports;
		},
		define = function(id, deps, factory) { // 模块定义必须要有id
			factory == void 0 && (factory=deps, deps= null); // 如果factory是undefined，则覆盖factory，deps置空
			deps = deps ? [].concat(deps) : [];
			modules[id] = new Module(id, deps, factory);
			
			console.log('module define id : ' + id); // @debug
			
			return id;
		},
		require = function(ids) {
			var reqs = [];

			ids = [].concat(ids);

			ids.forEach(function(id){
			 	reqs.push(getExports(id));
			});

			return reqs.length == 1 ? reqs[0] : reqs;
		};

	global.modules = modules;
	global.require = require;
	global.define = define;
})(window);
