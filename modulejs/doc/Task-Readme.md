# Task - 轻量级异步流程控制工具 #
-------------------
## 背景 ##

Task在Android中开发HybridApp中由于前台和终端交互方式发生变更（由终端使用`webview.addJavascriptInterface`注册接口改为**伪协议**，如重载`shouldOverrideUrlLoading`）的情况下封装的。

> 需要了解一下

> 1. Android在使用`addJavascriptInterface`向webview注册接口的时候把Object的**所有的**公共方法都直接提供给JS调用，也就是说可以通过终端提供的方法进行反射拿到JAVA的顶层类执行系统代码。这里存在着非常大的安全隐患，所以建议所有前台/终端交互的方式都通过**伪协议**的方式进行。

> 2. 实际上`webview.addJavascriptInterface`和**伪协议**对于终端来说没有本质区别。JS调用终端的方法依然会block webview的渲染（整个webview卡住，因为都在一个主线程上）。

> 3. `shouldOverrideUrlLoading`只是其中的一种实现方式，原理其实就通过一些终端内置的并且能够接收前台传参方式来进行交互。例如`alert`、`console.log`、`confirm`、`prompt`等实现。


但是对于前台来说，两种方式的切换是毁灭性的。因为addJavascriptInterface是**同步**返回，而伪协议是**异步**的。如：

```js
    // addJavascriptInterface
    var version = window.agent.getVersion("Android");
    
    
    // 伪协议，本例子用console.log实现
    
    // Schema://NameSpace/Method/RequestID?key=vale
    console.log("JsBridge://agent/getVersion/1?type=Android"); // 调用终接口
    // 终端统一回调前台接口再做分发，注意此处是JAVA代码
    // window.callback(RequestID, {data...})
    webview.loadURL("javascript:window.callback('1', {ret:0, data:'4.0.4'});void(0);"); // 终端回调 
    
    // 最后的代码可能是这样子 agent.get** 是前台封装好的方法
    agent.getVersion(function(version) {
        // others
    });

    // 甚至，而且细心的同学肯定发现，这里一次拉多个数据的操作是串行的，这无疑给本身执行的速度带来硬伤

    agent.getVersion(function(version) {
        agent.getKey1(arg1, arg2, function(key1) {
            agent.getKey2(arg3, arg4, function(key2){
                    // do something
            });
        });
    });
    
```

可以看到，切换伪协议之后的前台代码，每次获取数据都需要作一系列的操作，并且这个是异步的回调。而前台代码本身也有对终端提供的方法作一定的封装并且和逻辑混杂在一起，那么这里每获取一个数据都需要传一个CallBackFun，并且这个CallBackFun需要**至顶而下**的传递。这无疑是对之前封装的代码一个**巨大的伤害**。

## 能干什么 ##

而用Task之后，可以使封装的代码改成异步之后**更优雅**，并且**在和一些很恶心的逻辑混杂在一起的时候也具备可读性**。


```js
    // Task 实现调用agent.getVersion
    require("Task").create(agent.getVersion()).then(function(version) {
        // do something
    }).start();
    
    // Task 实现批量拉取数据，这里每一个获取的数据都是并行的
    require("Task").create().map(function() {
        return {
            version: agent.getVersion(),
            key1: agent.getKey1(arg1, arg2), // 不改变原有封装参数结构
            key2: agent.getKey2(arg3, arg4)
        };
    }).then(function(ret) { // 这里的ret值就是map操作返回的对象，非常直观
        alert(ret.version);
        // do something
    }).start();
```

> 注意：

> 1. 上述例子agent.get**需要用Task进行封装
> 2. Task只是一个控制异步操作的一个工具，其中**调用终端方法**和**分发终端回调**并不在Task中实现
> 3. 当然，这只是前台/终端交互解决方案的异步流控制的一小部分。

实际上，Task是一个**完全和业务逻辑相关的中间件，可以和任意的异步逻辑接合**。

## 起源 ##

在JS历史上有很多异步编程工具，包括[Step][1]、[Async][2]、甚至有[赵姐夫][3]的[Wind.js][4]。这些工具都是为了更方便的简化异步编程工作，并且使代码可读性增加。

Task也是其中的一员。

> 必须得提一下的是Wind.js给我的震撼是非常大的，正如赵姐夫所说[Wind.js的唯一目的便是“改善编程体验”][7]，但是经过Wind.js预处理过的JS代码在终端上调试难度会增加（只能打log，木有断点），最后被我舍弃了。当然，Task也能一定程度上改善异步编程的体验，这会在后续的例子里面体现出来。


在实现异步编程这个问题上已经有很多不同的方案，Task使用的是Promise异步模型。个人认为Promise中规定的是对一个异步操作的模型，操作的结果通过成功和失败两种状态的回调来赋予后续操作。其中有标准[Promises/A][5]甚至[Promises/A+][6]，而Task只是实现了Promises/A的一部分，并进行了一些修改以适用更复杂的场景。

## 特性 ##

Task是一个非常轻量级的工具，所以本身支持特性并不多。

1. 支持链式调用。
2. 支持`.then(onFulfilled,onRejected)`方法。
3. 支持`.resolve(msg)`和`.reject(msg)`执行成功/失败通知。
4. 支持Task的嵌套。
5. Task对象执行完之后自动销毁。
6. 在所有msg传递的过程中，**如果msg是Task的实例，就会把当前的Task Block住，当前的父Task会调用msg中的子Task的start方法启动子Task，等待子Task执行完后，把子Task的结果作为父Task下一个操作的输入**。
    
    > 这一点需要非常注意，是Task控制异步流的核心所在。

## API ##

正如前面所述，Task是一个轻量级的工具，提供的接口也非常简单易懂，容易上手。

### **Task.create(msg)** ###

可以通过`Task.create`方法创建Task实例，当然也可以用`new`关键字来创建实例。但是非常推荐用`Task.create`来创建实例。

```js
    /**
     * @param {Task|Function|Others} msg 初始化消息 
     */
	// Task = require("Task");

    // Task.create
    var task = Task.create(msg);
    // new 关键字
    var task = new Task(msg);

	// msg是一个Function
	var taskFun = Task.create(function() {
			return "TaskFun"; 
	});

	// msg是一个Task实例
	var taskTk = Task.create(Task.create("taskTk"));
```
> 注意：

> 1. 初始化的消息msg可以传入Task|Function的实例或者其他。msg这是**task的第一个操作**
> 2. msg是Task的实例，则task启动后**会先执行**msg传递的Task实例。再进行下一个操作。
> 3. msg是Function则task启动后会**优先处理**这个Fun，拿到返回值后再执行下一个操作。
> 4. msg是非Task、Function的对象，则**直接执行**下一个操作的成功回调。

### **.start()** ###

启动Task。Task开始执行。

```js
	// 启动Task实例
	task.start();
```

> 很遗憾，所有Task的实例必须手动启动。主要是为了支持Task的**嵌套**特性（建立父子Task之间的关系）。

### **.then(onFulfilled, onRejected)** ###

Task中**最基本**的方法，相对于上一个操作，其中`onFulfilled`是操作的成功回调，参数是操作结果，`onRejected`是操作的失败回调，参数是操作失败抛出的错误信息。

```js
	// then的用法，每一个then都是一个操作，并且可以获取到之前的操作的结果
	task.then(function(ret) {
		// do something
		...
		return ret1; // 直接使用return作为下一个操作的输入，符合编程习惯
	}, function(error){
		// do something
	}).then(function(ret1){
		
	});
	
	// 一个简单的实例。
	// 例子中并没有出现失败回调，实际上在前台操作一般逻辑的时候，很少用到失败回调。
	// 除了请求XHR、JSONP、Image等会出现失败需要处理回调，其他情况失败回调可以为空

	Task.create(1).then(function(ret){ // 这里的ret的值是create时候传的参数

		console.log("task start ret : " + ret); // ret is 1

		var x = ret + 1; // ret is 2

		// return 一个Task的实例
        // 会block父Task下一个操作的执行，等这个子Task执行完后才执行父Task的下一个操作
		return Task.create(function(){ 
			return x + 1; // return value is 3
		}).then(function(childTaskRet){

			console.log("childtask onFulfilled ret : " + childTaskRet); // childTaskRet is 3

			return childTaskRet + 1;
		});

	}).then(function(ret){ // 获取上一个操作的结果，这个操作结果是上面返回子Task的结果

		console.log("task onFulfilled ret : " + ret); // ret is 4
		
	}).start(); // 别忘记启动task

	
```

### **.map(dataMap|function)** ###

`map`方法是基于`then`方法扩展出来，主要是用于**批量拉数据**的操作。而每个操作都是**并行**的。

> `then`方法的return值，只会判断是否Task的实例，即只能单个操作。而`map`方法会判断这个对象（map）里面的每个key-value中的value是否是Task的实例。

```js
    // map 方法例子
    task.map({ // 参数直接是一个Object
        key1: value1,
        key2: value2
    }).map(function(ret){ // 参数是一个Function，然后返回一个Object
        // 对获取到的数据进行操作
        return {
            key3: ret.key1,
            key4: ret.key2
        };
    }).then(function(ret) {
        console.log(ret.key3);
        // do something
    });
    
    // 使用map方法批量获取数据
    Task.create().map(function() {
        return { // 在这个Object中的Task获取数据是异步的，互不干扰的
            str: "Task result : ", // 非Task的值会直接返回
            pow: Task.create(2).then(function (ret) { // Task实例
                return Math.pow(2, ret); // return 4
            }),
            add: Task.create(Task.create(1).then(function (ret) { // 嵌套的Task实例
                return ret + ret; // return 2 
            })).then(function(parentRet) {
                return parentRet + parentRet; // return 4
            })
        };
    }).then(function (data) { // 这里data参数就是map方法的return值，非常的直观
        console.log(data.str + (data.pow + data.add)); // "Task result : 8"
    }).start()
```

### **.resolve(msg)** & **.reject(msg)** ###
`resolve`和`reject` 是Task里面手动触发回调的主要方法。但是实际上一般只在封装Adapter的时候需要使用。

1. `.resolve(msg)`和`.parentResolve(msg)`
    
    对于本操作，已经成功获取到数据，并且手动执行[父Task]下一个操作成功处理。

2. `.reject(msg)`和`.parentReject(msg)`

    和`resolve`相对，本操作操作失败，并且手动执行[父Task]下一个操作失败处理

> `r[parentR]esolve`和`r[parentR]eject`中传递的msg则分别作为`onFulfilled`和`onRejected`的参数。

```js
    // 拉取一个百度图片的异步回调例子
    Task.create("http://www.baidu.com/img/bdlogo.gif").then(function(url) {
        var t = this; // 保存引用
        return Task.create(function() {

            var i = new Image();
            i.onload = function() {
                t.resolve(i); // 这里是用父Task的引用直接调用resolve
            };
            i.onerror = function() {
                t.reject("loadError");  // 这里是用父Task的引用直接调用resolve
            };

            i.src = url;

            this.async = true; // 设置异步回调标志位
        });
    }).then(function(img) { // 成功回调里面获取到的是一个Image实例
        console.log("load img success!!" + img.src);
    }, function(errmsg) { // 获取失败，
        console.log("load img error" + errmsg);
    }).start();
    

```
> 一般情况下，在`.then`方法里面使用`return`默认是触发成功回调，但是这个过程是同步的，如果是需要异步进行回调会需要用到`.resolve(msg)`和`.reject(msg)`。同时，需要把task的`async`属性设置为`true`，表示当前task需要**异步返回**。

```js
    // 在一般场景更推荐封装一个Adapter，这样可以促进代码的重用，并且更好的发挥Task的能力
    var loadImgAdapter = function (src) {
        return Task.create().then(function () {
            var self = this,
                i = new Image();

            i.onload = function() {
                self.parentResolve(i); // 通知父Task触发成功回调
            };
            i.onerror = function() {
                self.parentReject("loadError"); // 通知父Task触发成功回调
            };

            i.src = src;

            this.async = true; // 设置异步回调标志位
        });
    };
    // 通过Adapter拉取图片
    Task.create(loadImgAdapter("http://www.baidu.com/img/bdlogo.gif")).then(function(img) {
        console.log("loadImgAdapter load img success!!" + img.src);
    }, function(errmsg) { // 获取失败，
        console.log("loadImgAdapter load img error" + errmsg);
    }).start();
    
    // 也可以用map批量拉取图片
    Task.create().map({
        "bdlogo": loadImgAdapter("http://www.baidu.com/img/bdlogo.gif"),
        "search_logo":  loadImgAdapter("http://tb2.bdstatic.com/tb/static-common/img/search_logo_7098cbef.png")
    }).then(function(success) {
        console.log("loadImgAdapter load img success!!" + success.bdlogo.src);
    }, function(error) {
        // 如果这里拉取图片失败，则会在error里面获知。
         console.log("loadImgAdapter load img success!!" + error.search_logo); // 加载图片失败的log
    }).start();
```

  [1]: https://github.com/creationix/step/
  [2]: https://github.com/caolan/async/
  [3]: http://jeffreyzhao.cnblogs.com/
  [4]: https://github.com/JeffreyZhao/wind
  [5]: http://wiki.commonjs.org/wiki/Promises/A
  [6]: http://promisesaplus.com/
  [7]: http://windjs.org/cn/blog/2012/07/infoq-interview-windjs-author-1/
