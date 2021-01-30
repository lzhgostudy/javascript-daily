
# Promise对象

## Promise 的含义

Promise 是异步编程的一种解决方案，比传统的解决方案————回调函数和事件————更合理和更加强大。它由社区最早提出和实现，ES6将其写进了语言标准，统一了用法，原生提供了 `Promise` 对象。

所谓 `Promise` ，简单说就是一个容器，里面保存着某个未来才会结束的事件，通常是一个异步操作的结果。从语法上，Promise是一个对象，从它可以获取异步操作的消息。Promise 提供统一的API，各种异步操作都可以用同样的方法进行处理。

`Promise` 对象有以下两个特点。

（1）对象的状态不受外界影响。 `Promise` 对象代表一个异步操作，有三种状态： `pending`进行中、`fulfilled`已成功、`rejected`已失败。只有异步操作的结果，可以决定当前是哪一个状态，任何其它操作都无法改变这状态。这也是`Promise`这个名字的由来，它的英语意思就是 **承诺**，表示其它手段无法改变。

（2）一旦状态改变，就不会再变，任何时候都可以得到这个结果。`Promise`对象的状态改变，只有两种可能：从 `pending` -> `fulfilled`，或 `pending` -> `rejected`。只要这两种情况发生，状态就会凝固了，不会再变了，会一直保持这个结果，这时就称为 `resolved`已定型。如果改变已发生了，你再对 `Promise` 对象添加回调函数，也会立即得到这个结果。这与事件Event完全不同，事件的特点是，如果你错过了它，再去监听，是得不到结果的。

注意，为了行文方便，本章后面的 `resolved` 统一只指 `fulfilled`状态，不包含 `rejected` 状态。

有了 Promise 对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，Promise 对象提供统一的接口，使得控制异步操作更加容易。

Promise 也有一些缺点。首先，无法取消 Promise ，一旦新建它就会立即执行，无法中途取消。其次，如果不设置回调函数，Promise 内部抛出的错误，不会反应到外部。第三，当处于 pending 状态时，无法得知目前进展到哪个阶段（刚刚开始还是即将完成）。

如果某些事件不断地反复发生，一般来说，使用Stream模式比部署Promise更好的选择。


## 基本用法

ES6规定，Promise 对象是一个构造函数，用来生成Promise实例。

下面创造了一个 Promise 实例：

```js
const promise = new Promise(function(resolve, reject) {
  //some ...code
  if(/*异步成功*/) {
    resolve(value)
  }else {
    reject(error)
  }
})
```

Promise 构造函数接受一个函数作为参数，该函数的两个参数分别是 resolve 和 reject。它们是两个函数，有JS引擎提供，不用自己部署。

resolve 函数的作用是，将Promise对象的状态从“未完成”变成“成功”（pending->resolved），在异步操作成功时调用，并将异步操作的结果，作为参数传递出去；reject函数的作用是，将 Promise对象的状态从“未完成”变为“失败”（pending->rejected），在异步操作失败时调用，并将异步操作报出的错误，作为参数传递出去。

Promise 实例生成以后，可以用 then 方法分别指定 resolved状态和rejected状态的回调函数。

```js
promise.then(function(value){
  //success
}, function(error) {
  //failure
})
```

then 方法可以接受两个回调函数作为参数。第一个回调函数是Promise对象的状态变为resolved时调用，第二个回调函数是Promise对象的状态变为rejected时调用的。这两个函数都是可选的，不一定要提供。它们都接受Promise对象传出去的值作为参数。

下面是一个Promise对象的简单例子。

```js
function timeout(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms, 'done');
  });
}

timeout(100).then(value => {
  console.log(value)
});
```

上面代码中，timeout 方法返回一个Promise实例，表示一段时间以后才会发生的结果。过了指定的时间（ms参数）以后，Promise实例的状态变为resolved, 就会触发then方法绑定的回调函数。

Promise新建后就会立即执行。

```js
let promise = new Promise(function(resolve, reject) {
  console.log("Promise");
  resolve();
});

promise.then(function() {
  console.log('resolved.')
});

console.log('Hi')
```

上面代码中，Promise新建后立即执行，所以首先输出的是Promise。然后，then方法指定的回调函数，将在当前脚本所有同步任务执行完才会执行，所以resolved最后输出。

下面是异步加载图片的例子。

```js
function loadImageAsync(url) {
  return new Promise((reslove, reject) => {
    const image = new Image();
    image.onload = function() {
      resolve(image)
    }
    image.src = url;

    image.onerror = function() {
      reject(new Error('Cloud not load image at ' + url))
    }
  })
}
```

上面代码中，使用Promise包装了一个图片加载的异步操作。如果加载成功，就调用resolve方法，否则就调用reject方法。

下面是一个用Promise对象实现的Ajax操作的例子。

```js
const getJSON = function(url) {
  const promise = new Promise(function(resolve, reject){
    const handler = function() {
      if(this.readyState !== 4) {
        return;
      }
      if(this.status === 200) {
        resolve(this.response);
      }else {
        reject(new Error(this.statusText));
      }
    };
    const client = new XMLHttpRequest();
    client.open("GET", url);
    client.onreadystatuschange = handler;
    client.responseType = 'json';
    client.setRequestHeader("Accept", "application/json");
    client.send();
  });

  return promise;
}

getJSON("/posts.json")
.then(function(json) {
  console.log('Content: ', json);
}, function(error) {
  console.error("出错了", error);
})
```

上面代码中，getJSON是对XMLHTTPRequest对象的封装，用于发出一个针对JSON数据的HTTP请求，并且返回一个Promise对象。需要注意的是，在getJSON内部，resolve函数和reject函数调用时，都带有参数。

如果调用resolve函数和reject函数时带有参数，那么它们的参数会被传递给回调函数。reject函数的参数通常是Error对象的实例，表示抛出的错误；resolve函数的参数除了正常的值以外，还可能是另一个Promise实例，比如像下面这样。

