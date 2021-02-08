
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

```js
const p1 = new Promise(function(resolve, reject) {
  //...
});

const p2 = new Promise(function(resolve, reject) {
  resolve(p1);
});
```

上面代码中，p1和p2 都是 Promise 的实例，但是 p2 的 resolve 方法将p1作为参数，即一个异步操作的结果是返回另一个异步操作。

注意，这时p1的状态就会传递给p2，也就是说，p1的状态决定了p2的状态，如果p1的状态是pending，那么p2的回调函数就会等待p1的状态改变；如果p1的状态已经是resolved或者rejected，那么p2的回调函数就会立刻执行。

```js
const p1 = new Promise(function(resolve, reject) {
  setTimeout(() => reject(new Error('fail')), 3000);
});

const p2 = new Promise(function(resolve, reject) {
  setTimeout(() => resolve(p1), 1000)
} )

p2.then(function(result) {
  console.log(result)
})
.catch(error => console.log(error))
```

上面代码中，p1是一个Promise, 3秒后变成 rejected. p2 的状态在1秒后改变，resolve方法返回的是p1。由于p2返回的是另一个Promise，导致p2自己的状态无效了，由于p1的状态决定p2的状态。所以，后面的then语句都变成针对后者(p1), 又过了2秒，p1变成reject，导致触发catch方法指定的回调函数。

注意，调用 resolve 或 reject 并不会终结Promise的参数函数执行。

```js
new Promise((resolve, reject) => {
  resolve(1);
  console.log(2)
}).then(r => {
  console.log(r);
});
```

上面代码中，调用 resolve(1) 以后，后面的 console.log(2) 还是会执行，并且会首先打印出来。
这时因为立即 resolved 的 Promise 是在本轮事件循环的末尾执行，总是晚于本轮循环的同步任务。

一般来说，调用resolve或reject 以后，Promise的使命就完成了，后继操作应该放到 then 方法里面，而不应该直接写在 resolve 或 reject 的后面。所以，最好在它们前面加上 return 语句，这样就不会有意外。

```js
new Promise((resolve, reject) => {
  return resolve(1);
})
```

---

## Promise.prototype.then()

Promise 实例具有 then 方法，也就是说，then 方法是定义在原型对象 Promise.prototype上的。它的作用是为Promise实例添加状态改变时的回调函数。前面说过，then 方法的第一个参数是 resolved 状态的回调函数，第二个参数是 rejected 状态的回调函数，它们都是可选的。

then 方法返回的是一个新的 Promise 实例（注意，不是原来那个Promise实例）。因此可以采用链式写法，即 then 方法后面再调用另一个 then 方法。

```js
getJSON("/posts.json").then(function(json) {
  return json.post; 
}).then(function(post) {
  //...
})
```

上面的代码使用 then 方法，依次指定了两个回调函数。第一个回调函数完成以后，会将返回结果作为参数，传入第二个回调函数。

采用链式的then，可以指定一组按照次序调用的回调函数。这时，前一个回调函数，有可能返回的还是一个Promise对象，即有异步操作，这时，后一个回调函数，就会等待该Promise对象的状态发生变化，才会被调用。

```js
getJSON("/post/1.json").then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  console.log("resolve: ", comments);
}, function(err) {
  console.log("rejected: ", err);
})
```

上面代码中，第一个 then 方法指定的回调函数，返回的是另一个 Promise 对象，这时，第二个 then 方法指定的回调函数，就会等待这个新的Promise对象状态发生变化。如果变为 resolved，就调用第一个回调函数，如果状态变为rejected，就调用第二个回调函数。

如果用箭头函数，上面的代码可以写得更简洁

```js
getJSON("/post/1.json").then(
  post => getJSON(post.commentURL)
).then(
  comments => console.log("resolved: ", comments),
  err => console.log("rejected: ", err);
)
```

---

## Promise.prototype.catch()

Promise.prototype.catch() 方法是 .then(null, rejection) 或 .then(undefined, rejection) 的别名，用于指定发生错误时的回调函数。

```js
getJSON('/post.json').then(function(post) {
  //..
}).catch(function(error) {
  console.log('occur error')
})
```

上面代码中，getJSON 方法返回一个 Promise 对象，如果该对象状态变为 resolved，则会调用 then() 方法指定的回调函数；如果异步操作抛出错误，状态就会变为 rejected，就会调用 catch 方法指定的回调函数，处理这个错误。另外，then() 方法指定的回调函数，如果运行中抛出错误，也会被catch() 方法捕获。

```js
p.then((val) => console.log('fulfilled: ', val))
  .catch((err) => console.log('rejected', err));

//等同于
p.then((val) => console.log('fulfilled: ', val))
  .then(null, (err) => console.log(err));
```

下面一个例子

```js
const promise = new Promise(function(resolve, reject) {
  throw new Error('test');
});
promise.catch(function(error) {
  console.log(error)
})
// Error: test
```

上面的代码中，promise 抛出一个错误，就被 catch() 方法指定的回调函数捕获。注意，上面的写法与下面两种写法是等价的。

```js
//写法一
const promise = new Promise(function(resolve, reject) {
  try {
    throw new Error('test')
  } catch(e) {
    reject(e)
  }
});
promise.catch(function(error) {
  console.log(error);
});

//写法二
const promise = new Promise(function(resolve, reject) {
  reject(new Error('test'));
});

promise.catch(function(error) {
  console.log(error);
})
```

比较上面两种写法，可以发现 reject() 方法的作用等同于抛出错误。

如果Promise 状态已经变成resolved, 再抛出错误时无效的。

```js
const promise = new Promise(function( resolve, reject) {
  resolve('ok');
  throw new Error('test');
});

promise
  .then(function(value) { console.log(value) })
  .catch(function(error) {console.log(error)});

// ok
```

上面代码中，Promise在resolve语句后面，在抛出错误，不会被捕获，等于没有抛出。因为 Promise的状态一旦改变，就永久保持该状态，不会再变了。

Promise 对象的错误具有”冒泡“性质，会一直向后传递，直到被捕获为止。也就是说，错误总是会被下一个 catch 语句捕获。

```js
getJSON('/post/1.json').then(function(post) {
  return getJSON(post.commentURL);
}).then(function(comments) {
  // some code
}).catch(function(error) {
  // 处理前面三个 Promise 产生的错误
})
```

上面代码中，一共三个 Promise 对象：一个由 getJSON() 产生，两个由then()产生。它们之中任何一个抛出的错误，都会被最后一个catch()捕获。

一般来说，不要在 then() 方法里定义 Reject 状态的回调函数（即 then 的第二个参数），总是使用 catch 方法。

```js
// bad
promise.then(function(data) {
  // success
}, function(err) {
  // error
});

//good
promise
  .then(function(data) {
    // success
  })
  .catch(function(err) {
    // error
  })
```

上面代码中，第二种写法要好于第一种写法，理由是第二种写法可以捕获前面then方法执行中的错误，也更接近同步的写法（try/catch）。因此，建议总是使用catch()方法，而不使用then()方法的第二个参数。

跟传统的try/catch代码块不同的是，如果没有使用catch()方法指定错误处理的回调函数，Promise 对象抛出的错误不会传递到外层代码，即不会有任何反应。

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为 x 没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  console.log('everything is great');
});

setTimeout(() => { console.log(123) }, 2000);
// Uncaught (in promise) ReferenceError: x is not defined
// 123

```

上面代码中，someAsyncThing()函数产生的 Promise 对象，内部有语法错误。浏览器运行到这一行，会打印出错误提示ReferenceError: x is not defined，但是不会退出进程、终止脚本执行，2 秒之后还是会输出123。这就是说，Promise 内部的错误不会影响到 Promise 外部的代码，通俗的说法就是“Promise 会吃掉错误”。

这个脚本放在服务器执行，退出码就是0（即表示执行成功）。不过，Node.js 有一个unhandledRejection事件，专门监听未捕获的reject错误，上面的脚本会触发这个事件的监听函数，可以在监听函数里面抛出错误。

```js
process.on('unhandledRejection', function(err, p) {
  throw err;
})
```

上面代码中，unhandledRejection事件的监听函数有两个参数，第一个是错误对象，第二个是报错的 Promise 实例，它可以用来了解发生错误的环境信息。

注意，Node 有计划在未来废除unhandledRejection事件。如果 Promise 内部有未捕获的错误，会直接终止进程，并且进程的退出码不为 0。

再看下面的例子。

```js
const promise = new Promise(function( resolve, reject ) {
  resolve('ok');
  setTimeout(function () {throw new Error('test')}, 0)
});

promise.then(function(value) { console.log(value) });
```

上面代码中，Promise 指定在下一轮 事件循环 再抛出错误。到了那个时候，Promise 的运行已经结束了，所以这个错误是在Promise函数体外抛出的，会冒泡到最外层，成了未捕获的错误。

一般建议，Promise 对象后面要跟 catch() 方法，这样可以处理 Promise 内部发生的错误。catch()方法返回的还是一个 Promise对象，因此后面还可以接着调用then()方法。

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
```

上面代码运行完catch()方法指定的回调函数，会接着运行后面那个then()方法指定的回调函数。如果没有报错，则会跳过catch()方法。

```js
Promise.resolve()
.catch(function(error) {
  console.log('oh no', error);
})
.then(function() {
  console.log('carry on');
});
// carry on
```

上面的代码因为没有报错，跳过了catch()方法，直接执行后面的then()方法。此时，要是then()方法里面报错，就与前面的catch()无关了。

catch()方法之中，还能再抛出错误。

```js
const someAsyncThing = function() {
  return new Promise(function(resolve, reject) {
    // 下面一行会报错，因为x没有声明
    resolve(x + 2);
  });
};

someAsyncThing().then(function() {
  return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
  // 下面一行会报错，因为 y 没有声明
  y + 2;
}).then(function() {
  console.log('carry on');
});
// oh no [ReferenceError: x is not defined]
```

上面代码中，catch()方法抛出一个错误，因为后面没有别的catch()方法了，导致这个错误不会被捕获，也不会传递到外层。如果改写一下，结果就不一样了。

```js
someAsyncThing().then(function() {
  return someOtherAsyncThing();
}).catch(function(error) {
  console.log('oh no', error);
  // 下面一行会报错，因为y没有声明
  y + 2;
}).catch(function(error) {
  console.log('carry on', error);
});
// oh no [ReferenceError: x is not defined]
// carry on [ReferenceError: y is not defined]
```

上面代码中，第二个catch()方法用来捕获前一个catch()方法抛出的错误。


## Promise.prototype.finally()

finally()方法用于指定不管 Promise 对象最后状态如何，都会执行的操作。该方法是 ES2018 引入标准的。

```js
promise
.then(result => {···})
.catch(error => {···})
.finally(() => {···});
```

上面代码中，不管promise最后的状态，在执行完then或catch指定的回调函数以后，都会执行finally方法指定的回调函数。

下面是一个例子，服务器使用 Promise 处理请求，然后使用finally方法关掉服务器。

```js
server.listen(port)
  .then(function () {
    // ...
  })
  .finally(server.stop);
```

finally 方法的回调函数不接受任何参数，这意味着没有办法知道，前面的 Promise 状态到底是fulfilled还是rejected。这表明，finally方法里面的操作，应该是与状态无关的，不依赖于 Promise 的执行结果。

finally本质上是then方法的特例。

```js
promise
.finally(() => {
  //...
});

// 等同于
promise
.then(
  result => {
    // 语句
    return result;
  },
  error => {
    // 语句
    throw error;
  }
);
```

上面代码中，如果不使用finally方法，同样的语句需要为成功和失败两种情况各写一次。有了finally方法，则只需要写一次。

它的实现也很简单。

```js
Promise.prototype.finally = function(callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  )
}
```

## Promise.all()

Promise.all()方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.all([p1, p2, p3]);
```

上面代码中，Promise.all() 方法接受一个数组作为参数， p1, p2, p3 都是Promise实例，如果不是，就会先调用下面讲到的Promise。resolve 方法，将参数转为 Promise实例，再进一步处理。另外，Promise.all()方法的参数可以不是数组，但必须具有 Iterator 接口，且返回的每个成员都是Promise 实例。

p 的状态由p1, p2, p3决定，分成两种情况。

1. 只有 p1, p2, p3 的状态都变成fulfilled, p 的状态才会变成fullfilled, 此时 p1, p2, p3 的返回值组成一个数组，传递给p的回调函数。

2. 只要p1, p2, p3 之中有一个被 rejected， p 的状态就会变成rejected, 此时第一个被reject的实例的返回值，会传递给 p 的回调函数。

下面是一个具体的例子。

```js
// 生成一个Promise对象的数组
const promises = [2, 3, 5, 7, 11, 13].map(function (id) {
  return getJSON('/post/' + id + ".json");
});

Promise.all(promises).then(function(posts) {
  //...
}).catch(function(reason) {
  //...
});
```

上面代码中，promises是包含 6 个 Promise 实例的数组，只有这 6 个实例的状态都变成fulfilled，或者其中有一个变为rejected，才会调用Promise.all方法后面的回调函数。

下面是另一个例子。

```js
const databasePromise = connectDatabase();

const booksPromise = databasePromise
  .then(findAllBooks);

const userPromise = databasePromise
  .then(getCurrentUser);
  
Promise.all([
  booksPromise,
  userPromise
])
.then(([ books, user ]) => pickTopRecommendations(books, user));
```

上面代码中，booksPromise和userPromise是两个异步操作，只有等到它们的结果都返回了，才会触发pickTopRecommendations这个回调函数。

注意，如果作为参数的 Promise 实例，自己定义了catch方法，那么它一旦被rejected，并不会触发Promise.all()的catch方法。

```js
const p1 = new Promise((resolve, reject) => {
  resolve('hello');
})
.then(result => result)
.catch(e => e);

const p2 = new Promise((resolve, reject) => {
  throw new Error('报错了');
})
.then(result => result)
.catch(e => e);

Promise.all([p1, p2])
.then(result => console.log(result))
.catch(e => console.log(e));
// ["hello", Error: 报错了]
```

如果p2没有自己的catch方法，就会调用Promise.all()的catch方法。


## Promise.race()

Promise.race() 方法同样是将多个 Promise 实例，包装成一个新的 Promise 实例。

```js
const p = Promise.race([p1, p2, p3]);
```

上面代码中，只要p1、p2、p3之中有一个实例率先改变状态，p的状态就跟着改变。那个率先改变的 Promise 实例的返回值，就传递给p的回调函数。

Promise.race()方法的参数与Promise.all()方法一样，如果不是 Promise 实例，就会先调用下面讲到的Promise.resolve()方法，将参数转为 Promise 实例，再进一步处理。

下面是一个例子，如果指定时间内没有获得结果，就将 Promise 的状态变为reject，否则变为resolve。

```js
const p = Promise.race([
  fetch('/resource-that-may-take-a-while'),
  new Promise(function(resolve, reject) {
    setTimeout(() => reject(new Error('request timeout')), 5000)
  })
]);

p.then(console.log)
  .catch(console.error);
```

上面代码中，如果 5 秒之内fetch方法无法返回结果，变量p的状态就会变为rejected，从而触发catch方法指定的回调函数。

## Promise.allsettled()

Promise.allSettled()方法接受一组Promise实例作为参数，包装成一个新的Promise实例，只有等到所有这些参数实例都返回结果，不管是 fulfilled 还是 rejected，包装实例才会结束。

```js
const promises = [
  fetch('/api-1'),
  fetch('/api-2'),
  fetch('/api-3'),
];

await Promise.allSettled(promises);
removeLoadingIndicator();
```

上面代码对服务器发出三个请求，等到三个请求都结束，不管请求成功还是失败，加载的滚动图标就会消失。

该方法返回的新的 Promise 实例，一旦结束，状态总是fulfilled，不会变成rejected。状态变成fulfilled后，Promise 的监听函数接收到的参数是一个数组，每个成员对应一个传入Promise.allSettled()的 Promise 实例。

```js
const resolved = Promise.resolve(42);
const rejected = Promise.reject(-1);

const allSettledPromise = Promise.allSettled([resolved, rejected]);

allSettledPromise.then(function (results) {
  console.log(results);
});
```

## Promise.resolve()

有时需要将现有对象转为 Promise 对象，Promise.resolve()方法就起到这个作用。

```js
const jsPromise = Promise.resolve($.ajax('/whatever.json'));
```

上面代码将 jQuery 生成的deferred对象，转为一个新的 Promise 对象。

Promise.resolve()等价于下面的写法。

```js
Promise.resolve('foo')
//等价于
new Promise(resolve => resolve('foo'))
```

Promise.resolve()方法的参数分成四种情况。

（1）参数是一个 Promise 实例
如果参数是 Promise 实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。


（2）参数是一个thenable对象
thenable对象指的是具有then方法的对象，比如下面这个对象。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};
```

Promise.resolve()方法会将这个对象转为 Promise 对象，然后就立即执行thenable对象的then()方法。

```js
let thenable = {
  then: function(resolve, reject) {
    resolve(42);
  }
};

let p1 = Promise.resolve(thenable);
p1.then(function (value) {
  console.log(value);  // 42
});
```

上面代码中，thenable对象的then()方法执行后，对象p1的状态就变为resolved，从而立即执行最后那个then()方法指定的回调函数，输出42。

（3）参数不是具有then()方法的对象，或根本就不是对象

如果参数是一个原始值，或者是一个不具有then()方法的对象，则Promise.resolve()方法返回一个新的 Promise 对象，状态为resolved。

```js
const p = Promise.resolve('Hello');

p.then(function (s) {
  console.log(s)
});
// Hello
```

上面代码生成一个新的Promise对象的实例 p。由于字符串 Hello 不属于异步操作，返回Promise实例的状态从一生成就是resolved，所以回调函数会立即执行。Promise.resolve()方法的参数，会同时传给回调函数。

（4）不带有任何参数

Promise.resolve()方法允许调用时不带参数，直接返回一个resolved状态的 Promise 对象。

所以，如果希望得到一个 Promise 对象，比较方便的方法就是直接调用Promise.resolve()方法。

```js
const p = Promise.resolve();

p.then(function () {
  // ...
});
```

上面代码的变量p就是一个 Promise 对象。

需要注意的是，立即resolve()的 Promise 对象，是在本轮“事件循环”（event loop）的结束时执行，而不是在下一轮“事件循环”的开始时。

```js
setTimeout(function () {
  console.log('three');
}, 0);

Promise.resolve().then(function () {
  console.log('two');
});

console.log('one');

// one
// two
// three
```

上面代码中，setTimeout(fn, 0)在下一轮“事件循环”开始时执行，Promise.resolve()在本轮“事件循环”结束时执行，console.log('one')则是立即执行，因此最先输出。


## Promise.reject()

Promise.reject(reason) 方法也会返回一个新的 Promise 实例，该实例的状态为rejected。

```js
const p = Promise.reject('出错了')
//等同于
const p = new Promise((resolve, reject) => reject('出错了'))

p.then(null, function(s) {
  console.log(s)
});
```

上面代码生成一个 Promise 对象的实例p，状态为rejected，回调函数会立即执行。

Promise.reject()方法的参数，会原封不动地作为reject的理由，变成后续方法的参数。

```js
Promise.reject('出错了')
.catch(e => {
  console.log(e === '出错了')
})
// true
```

上面代码中，Promise.reject()方法的参数是一个字符串，后面catch()方法的参数e就是这个字符串。