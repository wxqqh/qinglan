# modulejs

modulejs主要是面向已经把多个前台js文件concat为一个的情景。本身接口简单，只有`require`和`define`两个接口。

## 主要功能

* 定义模块和获取模块都是同步的，不提供异步加载模块的功能。
* 模块被定义之后只有第一次被获取的时候才会执行factory
* 模块定义时候必须要声明模块`id`

## sample
* 定义一个模块
```js
	define('a', function(require, exports, module){
		var msg = 'module a';

		exports.msg = msg;

		exports.show = function () {
			console.log(msg);
		}
	});
```
或者
```js
	define('b', function(){
		var msg = 'module b';

		return {
			msg: msg,
			show: function(){
				console.log(msg);
		}
	}
	});
```

* 获取一个模块
```js
	var a = require('a');
	a.show();
```

* 获取多个模块
```js
	require(['a', 'b'], function(a, b){
		a.show();
	});
```
