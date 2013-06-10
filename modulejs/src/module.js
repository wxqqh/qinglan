;~function () {
	var ID = 0,
		modules = {},
		is = function(type, obj){
			return Object.prototype.toString.call(obj).slice(8, -1) === type;
		},
		module = function(id, deps, factory) {
			this.id = id;
			this.deps = deps || [];
			this.factory = factory;
			this.exports = null;
		},
		defined = function(id, deps, factory) { // 模块定义必须要有id
			var m;
			is('function', deps) && (factory=deps, deps= null); // 如果deps是一个函数，则覆盖factory，deps置空
			deps = deps ? [].concat(deps) : [];
			m = new module(id, deps, factory);
			modules[id] = m;
		},
		require = function(ids,fn) {

		},
		require.async = function(ids, fn){

		}

}
