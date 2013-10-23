define('Task', function(require, exports, module) {
	'use strict';
	var isFun = function (obj) {
			return Object.prototype.toString.call(obj).slice(8,-1) == 'Function';
		},
		raf = window.requestAnimationFrame  || function(callback) {
				window.setTimeout(callback, 0);
			};

	/**
	 * Task 构造函数
	 * @param {Object|Function} msg 需要发送的消息
	 */
	function Task(msg) {
		this.msg = msg; // 传递的消息
		this.state = Task.STATE.INIT; // 当前task状态
		this.reason = null; // 出错的时候抛出的原因
		this.async = true; // task 采用同步返回

		this.parent = null; // 父调用Task对象
		this.handles = []; // 缓存需要处理的队列
		this.children = []; // 子Task对象数组
		this.context = {};
	}

	/**
	 * Task 状态
	 * @type {Object}
	 */
	Task.STATE = {
		INIT: 0, // 初始化
		DELEGATING: 1, // 代理
		FULFILLED: 2, // 条件满足 
		REJECTED: 3, // 条件失败
		FINISH: 4 // 回调结束
	};

	/**
	 * 是否Task对象<br/>特性判断
	 * @param  {Task|Object }  obj 被判断的对象
	 * @return {Boolean}     是否是Task对象
	 */
	Task.isTask = function(obj) {
		return obj && isFun(obj.then);
	};

	/**
	 * 创建一个Task实例
	 * @param  {Object|Function} msg 需要发送的消息
	 * @return {[type]}     [description]
	 */
	Task.create = function (msg) {
		return new Task(msg);
	};

	/**
	 * 执行Task
	 * @param  {Task} task  task
	 * @param  {Object} value 上一个Handle返回的值
	 * @param  {Task.STATE} state Task状态
	 * @return {Task}       Task
	 */
	Task.exec = function(task, value, state) {
		task.state = state;
		task.msg = value;
		if(Task.STATE.FINISH == this.state) return task;

		if(Task.isTask(value)){
			Task.reCall(task, value);
			return task;
		}

		var handle = task.handles.shift();	
		if(handle){
			var process = Task.strategy[handle.cmd]; // 获取到处理当前cmd的处理函数
			process && process.call(task, handle);
		} else {
			!task.async && task.parent &&  task.parent.resolve(task.msg); // 回调父Task
			!task.parent && Task.destroy(task);
		}
		return task;
	};

	/**
	 * Task.strategy 策略模式 回调方法 <br/>
	 * 
	 * @param  {Task} task Task
	 * @param  {Task|Object} ret  handle 返回值
	 */
	Task.reCall = function(task, ret) {
		if(Task.isTask(ret)) {
			task.state = Task.STATE.DELEGATING;
			ret.parent = task;
			task.children.push(ret);
			Task.STATE.INIT == ret.state ? ret.start() : ret.resolve(ret.msg);
		} else {
			task.resolve(ret);
		}
	};
	/**
	 * 销毁task
	 * 这个销毁操作是至底而上
	 * @param  {Task} task 需要销毁的Task对象
	 */
	Task.destroy = function(task) {
		task.children.forEach(function(t) {
			Task.destroy(t);
		});

		task.destroy();
	};
	// method plugin start ==================
	/**
	 * 策略模式
	 * @type {Object}
	 */
	Task.strategy = {
		'then': function(handle) {
			var fulfilled = handle.fulfilled,
				rejected = handle.rejected,
				ret = '';

			try{	
				ret = fulfilled && fulfilled.call(this, this.msg); // fulfilled回调
			} catch(e) { // 错误处理
				this.state = Task.STATE.REJECTED;
				this.reason = e.message;
				ret = rejected && rejected.call(this, e); // rejected回调
			}
			
			this.msg = ret;
			Task.reCall(this, ret); // 策略回调，进行下一步
		},
		'map': function(handle) {
			var task = this,
				map = handle.map,
				ctx = {},
				count = 0,
				cb = function (key, value) {
					count--;
					ctx[key] = value;

					count == 0 && Task.reCall(task, ctx); // 策略回调，进行下一步
				};
			for(var k in map) {
				count++;
				var v = map[k];
				(function(key, value) {
					raf(function() {
						if(isFun(value)) { // 如果是一个异步的fn，则创建Task在回调的时候执行
							Task.create().then(value).then(function(ret){
								cb(key, ret);
							}).start();
						} else { // 如果是一个对象，则直接调用cb
							cb(key, value);
						}
						
					});
				})(k, v);
			}

		}
	}
	/**
	 * Task then
	 * @param  {Function} fulfilled fulfilled回调
	 * @param  {Function} rejected  rejected回调
	 * @return {Task}           Task
	 */
	Task.prototype.then = function(fulfilled, rejected) {
		this.handles.push({
			cmd: 'then',
			fulfilled: fulfilled,
			rejected: rejected
		});
		return this;
	};
	/**
	 * Task Map
	 * @param  {Object} map 需要进行map操作的对象
	 * @return {Task}           Task
	 */
	Task.prototype.map = function(map) {
		this.handles.push({
			cmd: 'map',
			map: map
		});
		return this;
	};
	// plugin end ==================
	
	/**
	 * Task Next，执行下一个操作，执行fulfilled
	 * @param  {Task|Object} value Task next 传递参数
	 * @return {Task}       Task
	 */
	Task.prototype.resolve = function (value) {
		if(Task.STATE.REJECTED == this.state) return this;
		return Task.exec(this, value, Task.STATE.FULFILLED);
	};

	/**
	 * Task Reject，停止当前操作，执行rejected
	 * @param  {Object} value [description]
	 * @return {Task}       Task
	 */
	Task.prototype.reject = function (value) {
		return Task.exec(this, value, Task.STATE.REJECTED);
	};

	/**
	 * 回调parent 的 resolved，通知parent继续执行fulfilled
	 * @param  {Task|Object} value Task next 传递参数
	 * @return {Task}       Task
	 */
	Task.prototype.parentResolve = function (value) {
		this.parent && this.parent.resolve(value);
		return this;
	};
	
	/**
	 * 回调parent 的 rreject，通知parent继续执行rejected
	 * @param  {Task|Object} value Task next 传递参数
	 * @return {Task}       Task
	 */
	Task.prototype.parentReject = function (value) {
		this.parent && this.parent.reject(value);
		return this;
	};
	/**
	 * 开始执行Task
	 * @return {Task}       Task
	 */
	Task.prototype.start = function() {
		while(isFun(this.msg)) {
			this.msg = this.msg.call(this);
		}
		return this.resolve(this.msg); // start All
	};
 	
 	/**
 	 * 销毁Task
 	 * @return {Task}       Task
 	 */
 	Task.prototype.destroy = function() {
 		this.state = Task.STATE.FINISH;
		this.reason = null; // 出错的时候抛出的原因
		this.parent = null; // 父调用Task对象
		this.handles = []; // 缓存需要处理的队列
		this.context = {};
 	};

	module.exports = Task;
});
