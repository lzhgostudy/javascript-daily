
# async 函数

## 1. 含义

ES2017标准引入async函数，使得异步操作变得更加方便。

async函数时什么？一句话，它就是Generator函数的语法糖。

前文有一个Generator函数，依次读取两个文件。

```js
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

上面代码的函数`gen`可以写成`async`函数，就是下面这样。

```js
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
}
```

一比较就会发现，`async`函数就是将Generator函数的星号替换成`async`，将`yield`替换成`await`，仅此而已。

`async`函数对Generator函数的改进，体现在一下四点。

（1）内置执行器。

Generator函数的执行必须靠执行器，所以才有了`co`模块，而`async`函数自带执行器。也就是说，`async`函数的执行，与普通函数一模一样，只要一行。

```js
asyncReadFile();
```

上面代码调用了`asyncReadFile`函数，然后它就会自动执行，输出最后的结果。这完全不像Generator函数，需要调用`next`方法，或者用`co`模块，才能真正执行，得到最后结果。

（2）更好的语义

`async`和`await`，比起星号和`yield`，语义更加清楚了。`async`表示函数里面有异步操作，`await`表示紧跟后面的表达式需要等待结果。

（3）更广的适用性。

`co`模块约定，`yield`命令后面只能是Thunk函数或Promise对象，而`async`函数的`await`命令后面，可以是Promise对象和原始类型的值（数值，字符串和布尔值，但这时会自动转成立即resolve的Promise对象）。

（4）返回值是Promise

`async`函数的返回值是Promise对象，这比Generator函数的返回值是Iterator对象方便多了。你可以用`then`方法指定下一步的操作。

进一步说，`async`函数完全可以看做多个异步操作包装成一个Promise对象，而`await`命令就是内部`then`命令的语法糖。

---

## 2. 基本用法

`async`函数返回一个Promise对象，可以使用`then`方法添加回调函数。当函数执行的时候，一旦遇到`await`就会先返回，等到异步操作完成，再接着执行函数体内后面的语句。

下面是一个例子

```js
async function getStockPriceByName(name) {
  const symbol = await getStockSymbol(name);
  const stockPrice = await getStockPrice(symbol);
  return stockPrice;
}

getStockPriceByName('goog').then(function (result) {
  console.log(result);
});
```

上面代码是一个获取股票报价的函数，函数前面的`async`关键字，表明函数内部有异步操作。调用该函数时，会立即返回一个`Promise`对象。

下面是另一个例子，指定多少毫秒后输出一个值。

```js
function timeout(ms) {
  return new Promise(resolve => {
    setTimout(resolve, ms);
  })
}

async function asyncPrint(value, ms) {
  await timeout(ms)
  console.log(value);
}

asyncPrint('hello', 50);
```

上面代码指定50毫秒以后，输出`hello`.

由于`async`函数返回的是Promise对象，可以作为`await`命令的参数。所以，上面例子可以写出下面的形式。

```js
async function timeout(ms) {
  await new Promise(resolve => {
    setTimout(resolve, ms)
  })
}

async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}

asyncPrint('hello', 50);
```

async函数有多种形式。

```js
// 函数声明

async function foo() {}

// 函数表达式
const foo = async function () {};

// 对象的方法
let obj = { async foo() {} };

obj.foo().then(...)

// Class 的方法
class Storage {
  constructor () {
    this.cachePromise = caches.open('avatars');
  }

  async getAvatar(name) {
    const cache = await this.cachePromise;
    return cache.match(`/avatars/${name}.jpg`);
  }
}

const storage = new Storage();
storage.getAvatar('jake').then(…);

// 箭头函数
const foo = async () => {};
```

---

## 3. 语法

`async`函数的语法规则总体上比较简单，难点是错误处理机制。

### 返回Promise对象

`async`函数返回一个Promise对象。

`async`函数内部`return`语句返回的值，会成为`then`方法回调函数的参数。

```js
async function f() {
  return 'hello world';
}

f().then(v => console.log(v))
// "hello world"
```

上面代码中，函数`f`内部`return`命令返回的值，会被`then`方法回调函数接收到。

`async`函数内部抛出错误，会导致返回的Promise对象变为`reject`状态。抛出的错误对象会被`catch`方法回调函数接收到。

```js
async function f() {
  throw new Error('出错了');
}

f().then(
  v => console.log('resolve', v),
  e => console.log('reject', e)
)
//reject Error: 出错了
```

### Promise对象的状态变化

`async`函数返回的Promise对象，必须等到内部所有`await`命令后面的Promise对象执行完，才会发生状态改变，除非遇到 `return` 语句或者抛出错误。也就是说，只有`async`函数内部的异步操作执行完，才会执行`then`方法指定的回调函数。

```js
async function getTitle(url) {
  let response = await fetch(url);
  let html = await response.text();
  return html.match(/<title>([\s\S]+)<\/title>/i)[1];
}

getTitle('https://tc39.github.io/ecma262/').then(console.log)
```

上面代码中，函数`getTitle`内部有三个操作：抓取网页，取出文本，匹配页面标题。只有这个三个操作全部完成，才会执行`then`里面的`console.log`.


### await命令

正常情况下，`await`命令后面一个Promise对象，返回该对象的结果。如果不是Promise对象，就直接返回对应的值。

```js
async function f() {
  // 等同于 return 123;
  return await 123
}

f().then(v => console.log(v))
// 123

```

上面代码中，await命令的参数是数值123，这时等同于return 123。

另一种情况是，`await`命令后面一个`thenable`对象（即定义了`then`方法的对象），那么`await`会将其等同于`Promise`对象。

```js
class Sleep {
  constructor(timeout) {
    this.timeout = timeout
  }
  then(resolve, reject) {
    const startTime = Date.now();
    setTimeout(() => { resolve( Date.now() - startTime ), this.timeout })
  }
}

(async () => {
  const sleepTime = await new Sleep(1000);
  console.log(sleepTime);
})();
```

上面代码中，`await`命令后面是一个`Sleep`对象的实例。这个实例不是Promise对象，但是因为定义了`then`方法，`await`会将其视为`Promise`处理。

这个例子还演示了如何实现休眠效果。JavaScript一致没有休眠的语法，但是借助`await`命令就可以让程序停顿指定时间。下面给出了一个简化的`sleep`实现。

```js
function sleep(interval) {
  return new Promise(resolve => {
    setTimeout(resolve, interval)
  })
}

// 用法
async funciton one2FiveInAsync(){
  for(let i = 1; i <= 5; i++) {
    console.log(i);
    await sleep(1000);
  }
}

one2FiveInAsync();
```

`await`命令后面的Promise对象如果变为`reject`状态，则`reject`的参数会被`catch`方法的回调函数接收。

```js
async function f() {
  await Promise.reject('出错了');
}

f()
.then(v => console.log(v))
.catch(e => console.log(e))
// 出错了
```

注意 ，上面代码中，`await`语句前面没有 `return`，但是`reject`方法的参数依然传入了`catch`方法的回调函数。这里如果在`await`前面加上`return`，效果一样的。

任何一个`await`语句后面的`Promise`对象变为`reject`状态，那么整个`async`函数都会中断执行。

```js
async function f() {
  await Promise.reject('出错了');
  await Promise.resolve('hello world'); // 不会执行
}
```

上面代码中，第二个await语句是不会执行的，因为第一个await语句状态变成了reject。

有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个`await`放在`try...catch`结构里面，这样不管这个异步是否成功，第二个`await`都会执行。

```js
async function f() {
  try {
    await Promise.reject('出错了');
  } catch(e) {
  }
  return await Promise.resolve('hello world');
}

f()
.then(v => console.log(v))
// hello world
```