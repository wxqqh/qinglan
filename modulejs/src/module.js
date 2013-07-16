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
				duration = Date.now()
				exports = factory.apply(m, factory.length ? swap(deps, depList) : []);
				duration = Date.now() - duration;
			} else {
				exports = factory;
			}

			m.exports = exports || m.exports;
			console.log('module getExports id : ' + id + ' duration : ' + duration); // @debug
			return m.exports;
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
		require.async = function(ids, fn){
			setTimeout(function() { require(ids, fn) }, 0);
		};
	global.modules = modules,
	global.require = require,
	global.define = define;
})(window);
