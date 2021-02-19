

# Iterator和for...of循环

## 1. Iterator的概念

Javascript 原有的表示“集合”的数据结构，主要是数组 `Array`和对象 `Object`，ES6又添加了 `Map` 和 `Set` 。这样就有了4种数据集合，用户还可以组合使用它们，定义自己的数据结构，比如数组的成员是 `Map`, `Map`的成员是对象。这样就需要一种统一的接口机制，来处理所有不同的数据结构。

Iterator 就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。

Iterator 的作用有3个： 一是为各种数据结构提供一个统一的、简便的访问接口；二是使得数据结构的成员能够按某种次序排序；三是ES6创造了一种新的遍历命令 `for...of`循环，Iterator 接口主要提供 `for...of`消费。

Iterator 的遍历过程是这样的。

(1) 创造一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个对象。
(2) 第一次调用指针对象的 `next` 方法，可以将指针指向数据结构的第一个成员。
(3) 第二次调用指针对象的 `next` 方法，指针就指向数据结构的第二个成员。
(4) 不断调用指针对象的 `next` 方法，直到它指向数据结构的结束位置。

每一次调用 `next` 方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含 `value` 和 `done` 两个属性的对象。其中，`value` 属性是当前成员的值，`done` 属性是一个布尔值，表示遍历是否结束。

下面是一个模拟 `next` 方法返回值的例子。

```js
var it = makeIterator(['a', 'b']);

it.next()


function makeIterator(array) {
  var nextIndex = 0;

  return {
    next: function() {
      return nextIndex < array.length ? 
        { value: array[nextIndex++], done: false } :
        { value: undefined, done: true }
    }
  }
}
```

上面代码定义了一个 `makeIterator` 函数，它是一个遍历器生成函数，作用就是返回一个遍历器对象。对数组 `['a', 'b']` 执行这个函数，就会返回该数组的遍历器对象（即指针对象） `it`。

指针对象的 `next` 方法，用来移动指针。开始时，指针指向数组的开始位置。然后，每次调用 `next` 方法，指针就会指向数组的下一个成员。第一次调用，指向 `a` ；第二次调用，指向 `b`。

`next` 方法返回一个对象，表示当前数据成员的信息。这个对象具有 `value` 和 `done` 两个属性，`value` 属性返回当前位置的成员，`done`属性是一个布尔值，表示遍历是否结束，即是否还有必要再一次调用 `next` 方法。

总之，调用指针对象的`next`方法，就可以遍历事先给定的数据结构。

对于遍历器对象来说，`done:false`和`value:undefined`属性都可以省略的，因此上面的`makeIterator`函数可以简写成下面的形式。

```js
function makeIterator(array) {
  var nextIndex = 0;
  return {
    next: function() {
      return nextIndex < array.length ?
        { value: array[nextIndex++] } :
        { done: true }
    }
  }
}
```

由于Iterator只是把接口规格添加到数据结构上，所以，遍历器与它所遍历的那个数据结构，实际上是分开的，完全可以写出没有对应数据结构的遍历器对象，或者说用遍历器对象模拟出数据结构。下面是一个无限运行的遍历器对象的例子。

```js
var it = idMaker();

it.next().value // 0
it.next().value // 1
it.next().value // 2
// ...

function idMaker(){
  var index = 0;

  return {
    next: function() {
      return { value: index++, done: false }
    }
  }
}
```

上面的例子中，遍历器生成函数`idMaker`，返回一个遍历器对象(即指针对象)。但是并没有对应的数据结构，或者说，遍历器对象自己描述了一个数据结构出来。

如果使用 TypeScript 的写法，遍历器接口、指针对象和`next`方法返回值的规格可以描述如下：

```typescript
interface Iterable {
  [Symbol.iterator](): Iterator,
}

interface Iterator {
  next(value?: any) : IterationResult,
}

interface InterationResult {
  value: any,
  done: boolean
}
```

---

## 2. 默认 Iterator 接口

Iterator 接口的目的，就是为所有数据结构，提供了一种统一的访问机制，即 `for...of` 循环。当使用 `for...of` 循环遍历某种数据结构时，该循环会自动寻找 Iterator 接口。

一种数据结构只要部署了Iterator接口，我们就称这种数据结构是 “可遍历的”。

ES6规定，默认的Iterator接口部署在数据结构的 `Symbol.iterator`属性，或者说，一个数据结构只要具有 `Symbol.iterator` 属性，就可以认为是 “可遍历的”。`Symbol.iterator` 属性本身是一个函数，就是当前数据结构默认的遍历器生成函数。执行这个函数，就会返回一个遍历器。至于属性名`Symbol.iterator`，它是一个表达式，返回 `Symbol` 对象的 `iterator` 属性，这是一个预定义好的、类型为Symbol的特殊值，所以要放在方括号内。

```js
const obj = {
  [Symbol.iterator]: function () {
    return {
      next: function() {
        return {
          value: 1,
          done: true
        }
      }
    }
  }
}
```

上面代码中，对象 `obj` 是可遍历的，因为具备了`Symbol.iterator` 属性。执行这个属性，会返回一个遍历器对象。该对象的根本特征就是具有`next`方法。每次调用 `next` 方法，都会返回一个代表当前成员的信息对象，具有 `value` 和 `done` 两个属性。

ES6 的有些数据结构原生具备 Iterator 接口（比如数组），即不用任何处理，就可以被for...of循环遍历。原因在于，这些数据结构原生部署了Symbol.iterator属性（详见下文），另外一些数据结构没有（比如对象）。凡是部署了Symbol.iterator属性的数据结构，就称为部署了遍历器接口。调用这个接口，就会返回一个遍历器对象。

原生具备 Iterator 接口的数据结构如下。

- Array
- Map
- Set
- String
- TypedArray
- 函数的arguments对象
- NodeList对象

下面的例子是数组的`Symbol.iterator` 属性

```js
let arr = ['a', 'b', 'c'];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 'a', done: false }
iter.next() // { value: 'b', done: false }
iter.next() // { value: 'c', done: false }
iter.next() // { value: undefined, done: true }
```

上面代码中，变量 `arr` 是一个数组，原生就具有遍历器接口，部署在 `arr` 的 `Symbol.iterator` 属性上面。所以，调用这个属性，就得到遍历器对象。

对于原生部署 Iterator 接口的数据结构，不用自己写遍历器生成函数，`for...of` 循环会自动遍历它们。除此之外，其他数据结构（主要是对象）的Iterator接口，都需要自己在 `Symbol.iterator` 属性上面部署，这样才会被 `for...of` 循环遍历。

对象（Object）之所以没有默认部署Iterator接口，是因为对象的哪个属性先遍历，哪个属性后遍历是不确定的，需要开发者动手指定。本质上，遍历器是一种线性处理，对于任何非线性的数据结构，部署遍历器接口，就等于部署一种线性转换。不过，严格来说，对象部署遍历器接口并不是很必要，因为这时对象实际上被当做Map结构使用，ES5 没有 Map 结构，而ES6 原生提供了。

一个对象如果要具备可被 `for...of` 循环调用的Iterator接口，就必须在`Symbol.iterator`的属性上部署遍历器生成方法（原型链上的对象具有该方法也可）。

```js
class RangeIterator {
  constructor (start, stop) {
    this.value = start;
    this.stop = stop;
  }

  [Symbol.iterator]() {
    return this;
  }

  next () {
    var value = this.value;
    if(value < this.stop) {
      this.value++;
      return {
        done: false,
        value: value
      }
    }
    return {done: true, value: undefined};
  }
}

function range(start, stop) {
  return new RangeIterator(start, stop);
}

for (var value of range(0, 3)) {
  console.log(value); // 0, 1, 2
}
```

上面代码是一个类部署 Iterator 接口的写法。`Symbol.iterator` 属性对应一个函数，执行后返回当前对象的遍历器对象。

下面是通过遍历器实现指针结构的例子。

```js
function Obj (value) {
  this.value = value;
  this.next = null;
}

Obj.prototype[Symbol.iterator] = function() {
  var iterator = { next : next};

  var current = this;

  function next() {
    if (current) {
      var value = current.value;
      current = current.next;
      return {done: false, value: value}
    } else {
      return { done: true }
    }
  }
  return iterator;
}

var one  = new Obj(1);
var two = new Obj(2);
var three = new Obj(3);

one.next = two;
two.next = three;

for(var i of one) {
  console.log(i); // 1, 2, 3
}
```

上面代码首先在构造函数的原型链上部署 `Symbol.iterator` 方法，调用该方法会返回遍历器对象 `iterator` ，调用该对象的 `next` 方法，在返回一个值的同时，自动将内部指针移到下一个实例。

下面是另一个为对象添加 Iterator 接口的例子。

```js
let obj = {
  data: ['hello', 'world'],
  [Symbol.iterator] () {
    const self = this;
    let index = 0;
    return {
      next () {
        if (index < self.data.length) {
          return {
            value: self.data[index++],
            done: false
          };
        } else {
          return {
            value: undefined,
            done: true
          }
        }
      }
    }
  }
}
```

对于类似数组的对象（存在数值键名和 `length` 属性），部署 Iterator 接口，有一个简单方法，就是 `Symbol.iterator` 方法直接引用数组的 Iterator 接口。

```js
NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
// 或者
NodeList.prototype[Symbol.iterator] = [][Symbol.iterator];

[...document.querySelectorAll('div')] // 可以执行了
```

NodeList对象是类似数组的对象，本来就具备遍历接口，可以直接遍历。上面代码中，我们将它的遍历接口改成数组的 `Symbol.iterator` 属性，可以看到没有任何影响。

下面是另一个类似数组的对象调用数组的`Symbol.iterator`方法的例子。

```js
let iterable = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

for (let item of iterable) {
  console.log(item);  // a, b, c
}
```

注意，普通对象部署数组的 `Symbol.iterator` 方法，并无效果。

```js
let iterable = {
  a: 'a',
  b: 'b',
  c: 'c',
  length: 3,
  [Symbol.iterator]: Array.prototype[Symbol.iterator]
};

for (let item of iterable) {
  console.log(item);  // undefined, undefined, undefined
}
```

如果 `Symbol.iterator` 方法对应的不是遍历器生成函数，解析引擎将会报错。

```js
var obj = {};

obj[Symbol.iterator] = () => 1;

[...obj] // TypeError: [] is not a function
```

上面代码中，变量`obj`的`Symbol.iterator`方法对应的不是遍历器生成函数，因此报错。

有了遍历器接口，数据结构就可以用 `for...of` 循环遍历，也可以用`while` 循环遍历。

```js
var $iterator = ITERABLE[Symbol.iterator]();
var $result = $iterator.next();
while (!$result.done) {
  var x = $result.value;
  // ...
  $result = $iterator.next();
}
```

上面代码中，`ITERABLE`代表某种可遍历的数据结构，`$iterator`是它的遍历器对象。遍历器对象每次移动指针（`next`方法），都检查一下返回值的`done`属性，如果遍历还没结束，就移动遍历器对象的指针到下一步（`next`方法），不断循环。

---

## 3. 调用 Iterator 接口的场合

有一些场合会默认调用 Iterator 接口（`Symbol.iterator` 方法），除了下文会介绍`for...of`循环，还有几个别的场合。

（1）解构赋值

对数组和Set结构进行解构赋值时，会默认调用 `Symbol.iterator` 方法。

```js
let set = new Set().add('a').add('b').add('c');

let [x, y] = set;
// x='a'; y='b'

let [first, ...rest] = set;
// first='a'; rest=['b','c'];
```

（2）扩展运算符
扩展运算符（...）也会调用默认的 Iterator 接口。

```js
// 例一
var str = 'hello';
[...str] //  ['h','e','l','l','o']

// 例二
let arr = ['b', 'c'];
['a', ...arr, 'd']
// ['a', 'b', 'c', 'd']
```

上面代码的扩展运算符内部就调用了 Iterator 接口。

实际上，这提供了一种简便的机制，可以将任何部署了 Iterator 接口的数据结构，转为数组。也就是说，只要某个数据结构部署了 Iterator 接口，就可以对它使用扩展运算符，将其转为数组。

```js
let arr = [...iterable];
```

（3）yield*

`yield*` 后面跟的是一个可遍历的结构，它会调用该结构的遍历器接口。

```js
let generator = function* () {
  yield 1;
  yield* [2, 3, 4];
  yield 5;
};

var iterator = generator()

iterator.next() // { value: 1, done: false }
iterator.next() // { value: 2, done: false }
iterator.next() // { value: 3, done: false }
iterator.next() // { value: 4, done: false }
iterator.next() // { value: 5, done: false }
iterator.next() // { value: undefined, done: true }
```

（4）其他场合
由于数组的遍历会调用遍历器接口，所以任何接受数组作为参数的场合，其实都调用了遍历器接口。下面是一些例子。

- for...of
- Array.from()
- Map(), Set(), WeakMap(), WeakSet()（比如new Map([['a',1],['b',2]])）
- Promise.all()
- Promise.race()

## 4. 字符串的 Iterator 接口

字符串是一个类似数组的对象，也原生具有 Iterator 接口。

```js
var someString = 'hi';
typeof someString[Symbol.iterator]
// "function"

var iterator = someString[Symbol.iterator]();

iterator.next()  // { value: "h", done: false }
iterator.next()  // { value: "i", done: false }
iterator.next()  // { value: undefined, done: true }
```

上面代码中，调用 `Symbol.iterator` 方法返回一个遍历器对象，在这个遍历器上可以调用 next 方法，实现对于字符串的遍历。

可以覆盖原生的 `Symbol.iterator` 方法，达到修改遍历器行为的目的。

```js
var str = new String('hi');

[...str]; // ["h", "i"]

str[Symbol.iterator] = function () {
  return {
    next: function() {
      if(this._first) {
        this._first = false;
        return { value: "bye", done: false };
      } else {
        return { done: true };
      }
    },
    _first: true
  }
}

[...str] // ["bye"]
str // "hi"
```

上面代码中，字符串 str 的 `Symbol.iterator` 方法被修改了，所以扩展运算符（...）返回的值变成了bye，而字符串本身还是hi。

## 5. Iterator 接口 与 Generator 函数

`Symbol.iterator()` 方法的最简单实现，还是使用下一章要介绍的 Generator 函数。

```js
let myIterabel = {
  [Symbol.iterator]: function* () {
    yield 1;
    yield 2;
    yield 3;
  }
};
[...myIterable] // [1, 2, 3]

let obj = {
  * [Symbol.iterator]() {
    yield 'hello';
    yield 'world';
  }
};

for (let x of obj) {
  console.log(x);
}

// 'hello'
// 'world'
```
上面代码中，Symbol.iterator()方法几乎不用部署任何代码，只要用 yield 命令给出每一步的返回值即可。

## 6. 遍历器对象的 return(), throw()

遍历器对象除了具有 `next()` 方法，还可以具有 `return()` 方法和 `throw()` 方法。如果你自己写遍历器对象生成函数，那么 `next()` 方法是必须部署的，`return()` 方法和`throw()` 方法是否部署是可选的。

`return()` 方法的使用场景是，如果 `for...of` 循环提前退出（通常是因为出错，或者有`break`语句），就会调用`return()`方法。如果一个对象在完成遍历前，需要清理或者释放资源，就可以部署 `return()` 方法。

```js
function readLinesSync(file) {
  return {
    [Symbol.iterator]() {
      return {
        next() {
          return { done: false }
        },
        return() {
          file.close();
          return { done: true }
        }
      }
    }
  }
}
```

上面代码中，函数 `readLinesSync` 接受一个文件对象作为参数，返回一个遍历器对象，其中除了`next()`方法，还部署 `return()` 方法。下面的两种情况，都会触发执行 `return()` 方法。

```js
// 情况一
for (let line of readLinesSync(fileName)) {
  console.log(line);
  break;
}

// 情况二
for (let line of readLinesSync(fileName)) {
  console.log(line);
  throw new Error();
}
```

上面代码中，情况一输出文件的第一行以后，就会执行 `return()` 方法，关闭这个文件；情况二会在执行 `return()` 方法关闭文件之后，再抛出错误。

注意，`return()`方法必须返回一个对象，这是Generator 语法决定的。

`throw()` 方法主要是配合Generator函数使用，一般的遍历器对象用不到这个方法。

## 7. for...of 循环

ES6 借鉴 C++, Java, C#和Python语言，引入了`for...of`循环，作为遍历所有数据结构的统一的方法。

一个数据结构只要部署了`Symbol.iterator`属性，就被视为具有iterator接口，就可以用`for...of`循环遍历它的成员。也就是说，`for...of`循环内部调用的是数据结构的`Symbol.iterator` 方法。

`for...of` 循环可以使用的范围包括数组、Set、Map结构、某些类似数组的对象（比如 `argument` 对象、DOM NodeList对象）、后文的Generator对象，以及字符串。

### 数组

数组原生具备 `iterator`接口（即默认部署了`Symbol.iterator`属性），`for...of` 循环本质上就是调用这个接口产生的遍历器，可以用下面的代码证明。

```js
const arr = ['red', 'green', 'blue'];

for(let v of arr) {
  console.log(v); // red green blue
}

const obj = {};
obj[Symbol.iterator] = arr[Symbol.iterator].bind(arr);

for(let v of obj) {
  console.log(v); // red green blue
}
```

上面代码中，空对象`obj`部署了数组`arr`的`Symbol.iterator`属性，结果`obj`的`for...of`循环，产生了与`arr`完全一样的结果。

`for...of`循环可以代替数组实例的`forEach`方法。

```js
const arr = ['red', 'green', 'blue'];

arr.forEach(function (element, index) {
  console.log(element); // red green blue
  console.log(index);   // 0 1 2
});
```

JavaScript原有的`for...in`循环，只能获得对象的键名，不能直接获取键值。ES6提供`for...of`循环，允许遍历获取键值。

```js
var arr = ['a', 'b', 'c', 'd'];

for (let a in arr) {
  console.log(a); // 0 1 2 3
}

for (let a of arr) {
  console.log(a); // a b c d
}
```

上面代码表明，`for...in`循环读取键名，`for...of`循环读取键值。如果要通过`for...of`循环，获取数组的索引，可以借助数组实例的`entries`方法和`key`方法。

`for...of` 循环调用遍历器接口，数组的遍历器接口只返回具有数字索引的属性。这一点跟`for...in`循环也不一样。

```js
let arr = [3, 5, 7];
arr.foo = 'hello';

for (let i in arr) {
  console.log(i); // "0", "1", "2", "foo"
}

for (let i of arr) {
  console.log(i); //  "3", "5", "7"
}
```

上面代码中，for...of循环不会返回数组arr的foo属性。