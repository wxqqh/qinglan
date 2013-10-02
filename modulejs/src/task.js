define('Task', function(require, exports, module) {
	'use strict';
	var isFun = function (obj) {
		return Object.prototype.toString.call(obj).slice(8,-1) == 'Function';
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
	 * @param  {Task|Object }  obj [description]
	 * @return {Boolean}     [description]
	 */
	Task.isTask = function(obj) {
		return obj && isFun(obj.then);
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

		var handle = task.handles.shift();	
		if(handle){
			var process = Task.strategy[handle.cmd]; // 获取到处理当前cmd的处理函数
			process && process.call(task, handle);
		} else {
			!task.async && task.parent &&  task.parent.resolve(task.msg); // 回调父Task
			task.destroy();
		}
		return task;
	};

	/**
	 * Task.strategy 策略模式 回调方法 <br/>
	 * 
	 * @param  {[type]} task [description]
	 * @param  {[type]} ret  [description]
	 * @return {[type]}      [description]
	 */
	Task.reCall = function(task, ret) {
		if(Task.isTask(ret)) {
			task.state = Task.STATE.DELEGATING;
			ret.parent = task;
			Task.STATE.INIT == ret.state ? ret.start() : ret.resolve(ret.msg);
		} else {
			task.resolve(ret);
		}
	};

	// method plugin start ==================
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
	 * 开始执行Task
	 * @return {Task}       Task
	 */
	Task.prototype.start = function() {
		isFun(this.msg) && (this.msg = this.msg.call(this));
		return this.resolve(this.msg); // start All
	};
 	
 	/**
 	 * 销毁Task
 	 * @return {Task}       Task
 	 */
 	Task.prototype.destroy = function() {
		this.reason = null; // 出错的时候抛出的原因
		this.parent = null; // 父调用Task对象
		this.handles = []; // 缓存需要处理的队列
 	};

	module.exports = Task;
});