
# Class 的基本语法

## 1. 简介

### 类的由来

Javascript 语言中，生成实例对象的传统方法是通过构造函数。下面是一个例子：

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function() {
  return `(${this.x}, ${this.y})`;
};

var P = new Point(1, 2);
```

上面这种写法跟传统的面向对象语言（比如C++和Java）差异很大，很容易让新学习这门语言的程序员感到困惑。

ES6 提供了更接近传统语言的写法，引入了Class的概念，作为对象的模板。通过 `class` 关键字，可以定义类。

基本上，ES6 的 `class` 可以看做一个语法糖，它的绝大部分功能，ES5都可以做到，新的 `class` 写法只是让对象原型的写法更加清晰，更像面向对象编程的语法而已。上面的代码用 ES6 的`class` 改写，就是下面这样。

```js
class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `(${this.x}, ${this.y})`; 
  }
}
```

上面代码定义了一个 类，可以看到里面有一个 `constructor` 方法，这就是构造方法，而 `this` 关键字则代表实例对象。这种新的 Class 写法，本质上与本章开头的ES5的构造函数 `Point` 是一致的。

`Point` 类除了构造方法，还定义了一个 `toString()` 方法。注意，定义 `toString()` 方法的时候，前面不需要加上 `function` 这个关键字，直接把函数定义放进去了就可以了。另外，方法与方法之间不需要逗号分隔，加了就会报错。

ES6 的类，完全可以看做构造函数的另外一种写法。

```js
class Point {
  //...
}

typeof Point  // "function"
Point === Point.prototype.constructor // true
```

上面代码表明，类的数据类型就是函数，类本身就指向构造函数。

使用时，也是直接对类使用 `new` 命令，跟构造函数的用法完全一致。

```js
class Bar {
  doStuff() {
    console.log('stuff')
  }
}

const b = new Bar();
b.doStuff()
```

构造函数的 `prototype` 属性，在ES6 的类上面继续存在。事实上，类的所有方法都定义在类的 `prototype` 属性上面。

```js
class Point {
  constructor() {
    // ...
  }

  toString() {
    // ...
  }

  toValue() {
    // ...
  }
}

// 等同于

Point.prototype = {
  constructor() {},
  toString() {},
  toValue() {},
};
```

上面代码中，`constructor()`, `toString()`, `toValue()`这三个方法，其实都是定义在 `Point.prototype` 上面。

因此，在类的实例上面调用方法，其实就是调用原型上的方法。

```js
Class B {}
const b = new B();

b.constructor === B.prototype.constructor // true
```

上面代码中， `b` 是 `B` 类的实例，它的 `constructor()` 方法就是 `B` 类原型的`constructor()` 方法。

由于类的方法都定义在 `prototype` 对象上面，所以类的新方法可以添加在 `prototype` 对象上面。 `Object.assign()` 方法可以很方便地一次向类添加多个方法。

```js
class Point {
  constructor() {
    //...
  }
}

Object.assign(Point.prototype, {
  toString() {},
  toValue() {}
});
```

`prototype` 对象的 `constructor()` 属性，直接指向 类 的本身，这与 ES5 的行为是一致的。

```js
Point.prototype.constructor === Point // true
```

另外，类的内部所有定义的方法，都是不可枚举的

```js
class Point {
  constructor(x, y) {
    // ...
  }

  toString() {
    // ...
  }
}

Object.keys(Point.prototype)
// []
Object.getOwnPropertyNames(Point.prototype)
// ["constructor","toString"]
```

上面代码中，`toString()` 方法是 `Point` 类内部定义的方法，它是不可枚举的。这一点与ES5的行为不一致。

```js
var Point = function (x, y) {
  // ...
}

Point.prototype.toString = function() {
  // ....
};

Object.keys(Point.prototype)
// ["toString"]
Object.getOwnPropertyNames(Point.prototype)
// ["constructor", "toString"]
```

上面代码采用 ES5 的写法，toString()方法就是可枚举的。

### constructor 方法

`constructor()` 方法是类的默认方法，通过 `new` 命令生成对象实例时，自动调用该方法。一个类必须有 `constructor()` 方法，如果没有显式定义，一个空的 `constructor()` 方法会被默认添加。

```js
class Point {}

// 等价于

class Point {
  constructor() {}
}
```

