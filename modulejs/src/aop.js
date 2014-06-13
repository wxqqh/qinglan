/**
 * AOP 支持
 * from http://www.alloyteam.com/2013/05/javascript-code-with-aop-improvement/#prettyPhoto
 * 这个页面目前已经不能打开.
 */

/**
 * 添加前置方法
 * @param {Function} func 前置方法
 *
 */ 
Function.prototype.before = function(func) {
	var _self = this;
	return function() {
		if (func.apply(this, arguments) === false) {
			return false;
		}
		return _self.apply(this, arguments);
	}
}

/**
 * 添加后置方法
 * @param {Function} func 后置方法
 *
 */ 
Function.prototype.after = function(func) {
	var _self = this;
	return function() {
		var ret = _self.apply(this, arguments);
		if (ret === false) {
			return false;
		}
		func.apply(this, arguments);
		return ret;
	}
}

