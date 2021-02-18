
# Symbol

### 1. 概述

ES5 的对象属性名都是字符串，这容易造成属性名的冲突。比如，你使用了一个他人提供的对象，但又想为这个对象添加新的方法（mixin模式），新方法的名字就有可能与现有方法产生冲突。如果有一种机制，保证每个属性的名字都是独一无二的就好了，这样就从根本上防止属性名的冲突。这就是ES6引入 `Symbol` 的原因。

ES6 引入了一种新的原始数据类型 `Symbol`，表示独一无二的值。它是JavaScript语言的第七种数据类型，前六种是：`undefined`, `null`, `Boolean`, `String`, `Number`, `Object`。

Symbol值通过`Symbol` 函数生成。这就是说，对象的属性名现在可以有两种类型，一种是原来就有的字符串，另一种就是新增的Symbol类型。凡是属性名属于Symbol类型，就都是独一无二的，可以保证不会与其他属性名产生冲突。

```js
let s = Symbol()

typeof s
// "symbol"
```

上面代码中，变量 `s` 就是一个独一无二的值。 `typeof` 运算符的结果，表明变量 `s` 是Symbol数据类型，而不是字符串之类的其他类型。

注意，`Symbol` 函数前不能使用 `new` 命令，否则会报错。这是因为生成的Symbol是一个原始类型的值，不是对象。也就是说，由于Symbol值不是对象，所以不能添加属性。基本上，它是一种类似于字符串的数据类型。

`Symbol` 函数可以接受一个字符串作为参数，表示对Symbol实例的描述，主要是为了在控制台显示，或者转为字符串时，比较容易区分。

```js
let s1 = Symbol('foo');
let s2 = Symbol('bar');

s1 // Symbol(foo)
s2 // Symbol(bar)

s1.toString() // "Symbol(foo)"
s2.toString() // "Symbol(bar)"
```

上面代码中， `s1` 和 `s2` 是两个 Symbol 值。如果不加参数，它们在控制台的输出都是 `Symbol()`, 不利于区分。有了参数以后，就等于为它们加上了描述，输出的时候就能够分清，到底是哪个值。

如果Symbol的参数是一个对象，就会调用该对象的`toString`方法，将其转为字符串，然后才生成一个Symbol值。

```js
const obj = {
  toString() {
    return 'abc';
  }
};

const sym = Symbol(obj);
sym // "Symbol(abc)"
```

注意，`Symbol` 函数的参数只是表示对当前Symbol值的描述，因此相同参数的 `Symbol` 函数的返回值是不相等的。

```js
// 没有参数的情况
let s1 = Symbol()
let s2 = Symbol()

s1 === s2 // false

// 有参数的情况
let s1 = Symbol('foo')
let s2 = Symbol('foo')

s1 === s2 // false
```

上面代码中，`s1` 和 `s2` 都是 `Symbol` 函数的返回值，而且参数相同，但是它们是不相等的。

Symbol 值不能与其他类型的值进行运算，会报错。

```js
let sym = Symbol('My symbol');

"your symbol is " + sym
// TypeError: can't convert symbol to string
`your symbol is ${sym}`
// TypeError: can't convert symbol to string
```

但是，Symbol 值可以显式转为字符串。

```js
let sym = Symbol('My symbol');

String(sym) // 'Symbol(My symbol)'
sym.toString()  // 'Symbol(My symbol)'
```

另外，Symbol值也可以转为布尔值，但是不能转为数值。

```js
let sym = Symbol();
Boolean(sym)  // true
!sym //false

if(sym) {
  // ...
}

Number(sym) // TypeError
sym + 2 // TypeError
```

### 2. Symbol.prototype.description

创建Symbol 的时候，可以添加一个描述。

```js
const sym = Symbol('foo');
```

上面代码中，`sym` 的描述就是字符串 `foo`

但是，读取这个描述需要将 Symbol 显式转为字符串，即下面的写法：

```js
const sym = Symbol('foo');

String(sym) // "Symbol(foo)"
sym.toString()  // "Symbol(foo)"
```

上面的用法不是很方便。ES2019提供了一个实例属性 `description`，直接返回Symbol的描述。

```js
const sym = Symbol('foo');

sym.description // "foo"
```


### 3. 作为属性名的Symbol

由于每一个Symbol值都是不相等的，这意味着Symbol值可以作为标识符，用于对象的属性名，就能保证不会出现同名的属性。这对于一个对象由多个模块构成的情况非常有用，能防止某一个键被不小心改写或覆盖。

```js
let mySymbol = Symbol()

// 第一种写法
let a = {};
a[mySymbol] = 'Hello!';

// 第二种写法
let a = {
  [mySymbol]: 'Hello!'
};

// 第三种写法
let a = {};
Object.defineProperty(a, mySymbol, {value: 'Hello!'});

//以上写法都得到相同结果
a[mySymbol] // "Hello!"
```

上面代码通过方括号结构和 `Object.defineProperty`, 将对象的属性名指定为一个Symbol值。

注意，Symbol 值作为对象属性名时，不能用点运算符。

```js
const mySymbol = Symbol();
const a = {};

a.mySymbol = 'Hello!';
a[mySymbol] // undefined
a['mySymbol'] // "Hello!"
```

上面代码中，因为点运算符后面总是字符串，所以不会读取 `mySymbol` 作为标识名所指代的那个值，导致 `a` 的属性名实际上是一个字符串，而不是一个 Symbol 值。

同理，在对象的内部，使用 Symbol 值定义属性时，Symbol 值必须放在方括号中。

```js
let s = Symbol();

let obj = {
  [s]: function (arg) { ... }
};

obj[s](123);

```

上面代码中，如果 `s` 不放在方括号中，该属性的键名就是字符串 `s`，而不是 `s` 所代表的那个 Symbol 值。

采用增强的对象写法，上面代码的 `obj` 对象可以写得更简洁一些。

```js
let obj = {
  [s](arg) { ... }
}
```

Symbol 类型还可以用于定义一组常量，保证这组常量的值都是不相等的。

```js
const log = {};

log.levels = {
  DEBUG: Symbol('debug'),
  INFO: Symbol('info'),
  WARN: Symbol('warn')
};

console.log(log.levels.DEBUG, 'debug message');
console.log(log.levels.INFO, 'info message');
```

下面是另外一个例子。

```js
const COLOR_RED = Symbol();
const COLOR_GREEN = Symbol();

function getComplement(color) {
  switch(color) {
    case COLOR_RED: 
      return COLOR_GREEN;
    case COLOR_GREEN:
      return COLOR_RED;
    default:
      throw new Error('Undefined color');
  }
}
```

常量使用Symbol值最大的好处，就是其他任何值都不可能有相同的值了，因此可以保证上面的 `switch` 语句会按设计的方式工作。

还有一点要注意，Symbol值作为属性名时，该属性还是公开属性，不是私有属性。

---

## 4. 实例：消除魔术字符串

魔术字符串是指，在代码中出现多次，与代码形成强耦合的某一个具体的字符串或者数值。风格良好的代码，应该尽量消除魔术字符串，改由含义清晰的变量代替。

```js
function getArea(shape, options) {
  let area = 0;

  switch (shape) {
    case 'Triangle': // 魔术字符串
      area = .5 * options.width * options.height;
      break;
    /* ... more code ... */
  }

  return area;
}

getArea('Triangle', { width: 100, height: 100 }); // 魔术字符串
```

上面代码中，字符串Triangle就是一个魔术字符串。它多次出现，与代码形成“强耦合”，不利于将来的修改和维护。

常用的消除魔术字符串的方法，就是把它写成一个变量。

```js
const shapeType = {
  triangle: 'Triangle'
};

function getArea(shape, options) {
  let area = 0;
  switch (shape) {
    case shapeType.triangle:
      area = .5 * options.width * options.height;
      break;
  }
  return area;
}

getArea(shapeType.triangle, { width: 100, height: 100 });
```

上面代码中，我们把Triangle写成shapeType对象的triangle属性，这样就消除了强耦合。

如果仔细分析，可以发现 `shapeType.triangle` 等于哪个值并不重要，只要确保不会跟其他 `shapeType` 属性的值冲突即可。因此，这里很适合改用 Symbol 值。

```js
const shapeType = {
  triangle: Symbol()
};
```

上面代码中，除了将shapeType.triangle的值设为一个 Symbol，其他地方都不用修改。

## 5. 属性名的遍历

Symbol 作为属性名，遍历对象的时候，该属性不会出现在`for...in`, `for...of`循环中，也不会被`Object.keys()`，`Object.getOwnProperty()`, `JSON.stringify()` 返回。

但是，它也不是私有属性，有一个`Object.getOwnPropertySymbols()`方法，可以获取指定对象的所有 Symbol 属性名。该方法返回一个数组，成员是当前对象的所有用作属性名的Symbol值。

```js
const obj = {};
let a = Symbol('a');
let b = Symbol('b');

obj[a] = 'Hello';
obj[b] = 'World';

const objectSymbols = Object.getOwnPropertySymbols(obj);

objectSymbols
// [Symbol(a), Symbol(b)]
```

上面代码是`Object.getOwnPropertySymbols()`方法的示例，可以获取所有 Symbol 属性名。

下面是另一个例子，`Object.getOwnPropertySymbols()`方法与`for...in`循环、`Object.getOwnPropertyNames`方法进行对比的例子。

```js
const obj = {};
const foo = Symbol('foo');

obj[foo] = 'bar';

for (let i in obj) {
  console.log(i); // 无输出
}

Object.getOwnPropertyNames(obj) // []
Object.getOwnPropertySymbols(obj) // [Symbol(foo)]
```

上面代码中，使用for...in循环和Object.getOwnPropertyNames()方法都得不到 Symbol 键名，需要使用Object.getOwnPropertySymbols()方法。

另一个新的 API，Reflect.ownKeys()方法可以返回所有类型的键名，包括常规键名和 Symbol 键名。

```js
let obj = {
  [Symbol('my_key')]: 1,
  enum: 2,
  nonEnum: 3
};

Reflect.ownKeys(obj)
//  ["enum", "nonEnum", Symbol(my_key)]
```

由于以Symbol值作为键名，不会被常规方法遍历得到。我们可以利用这个特性，为对象定义一些非私有的、但又希望只用于内部的方法。

```js
let size = Symbol('size');

class Collection {
  constructor() {
    this[size] = 0;
  }

  add(item) {
    this[this[size]] = item;
    this[size]++;
  }

  static sizeOf(instance) {
    return instance[size];
  }
}

let x = new Collection();
Collection.sizeOf(x)

x.add('foo');
Collection.sizeOf(x) // 1

Object.keys(x) // ['0']
Object.getOwnPropertyNames(x) // ['0']
Object.getOwnPropertySymbols(x) // [Symbol(size)]
```

上面代码中，对象x的size属性是一个 Symbol 值，所以Object.keys(x)、Object.getOwnPropertyNames(x)都无法获取它。这就造成了一种非私有的内部方法的效果。

## 6. Symbol.for(), Symbol.keyFor()

有时，我们希望重新使用同一个Symbol值，`Symbol.for()` 方法可以做到这一点。它接受一个字符串作为参数，然后搜索有没有以该参数作为名称的Symbol值。如果有，就返回这个Symbol值，否则就新建一个以该字符串为名称的Symbol值，并将其注册到全局。

```js
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2
```

上面代码中，`s1` 和 `s2` 都是Symbol值，但是它们都是由同样参数的`Symbol.for`方法生成的，所以实际上是同一个值。

`Symbol.for()` 与 `Symbol()` 这两种写法，都会生成新的Symbol。它们的区别是，前者会被登记在全局环境中共搜索，后者不会。`Symbol.for()`不会每次调用就返回一个新的Symbol类型的值，而是会先检查给定的`key`是否已存在，如果不存在才会新建一个值。比如，如果你调用`Symbol.for("cat")` 30次，每次都会返回同一个Symbol值，但是调用 `Symbol("cat")` 30次，会返回30个不同的Symbol值。

```js
Symbol.for("bar") === Symbol.for("bar")
// true

Symbol("bar") === Symbol("bar")
// false
```

上面代码中，由于Symbol()写法没有登记机制，所以每次调用都会返回一个不同的值。

`Symbol.keyFor()`方法返回一个已登记的Symbol类型值的`key`。

```js
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"

let s2 = Symbol("foo");
Symbol.keyFor(s2) // undefined
```
上面代码中，变量 `s2` 属于未登记的Symbol 值，所以返回 `undefined`。

注意，`Symbol.for()` 为 Symbol 值登记的名字，是全局环境的，不管有没有在全局环境运行。

```js
function foo() {
  return Symbol.for('bar');
}

const x = foo();
const y = Symbol.for('bar');
console.log(x === y); // true
```

上面代码中，`Symbol.for('bar')` 是函数内部运行的，但是生成的Symbol值是登记在全局环境的。所以，第二次运行`Symbol.for('bar')`可以取到这个Symbol`值。

`Symbol.for()` 的这个全局登记特性，可以用在不同的 iframe 或 service worker 中取到同一个值。

```js
iframe = document.createElement('iframe');
iframe.src = String(window.location);
document.body.appendChild(iframe);

iframe.contentWindow.Symbol.for('foo') === Symbol.for('foo')
// true
```

上面代码中，iframe 窗口生成的 Symbol 值，可以在主页面得到。

## 7. 实例：模块的Singleton模式

Singleton模式值的是调用一个类，任何时候都返回同一个实例。

对于Node来说，模块文件可以看成是一个类。怎么保证每次执行这个模块文件，返回的都是同一个实例？

很容易想到，可以把实例放到顶层对象 `global`。

```js
// mod.js
funciton A () {
  this.foo = 'hello';
}
if (!global._foo) {
  global._foo = new A();
}

module.exports = global._foo;
```

然后，加载上面的mod.js。

```js
const a = require('./mod.js');
console.log(a.foo);
```

上面代码中，变量a任何时候加载的都是A的同一个实例。

但是，这里有一个问题，全局变量global._foo是可写的，任何文件都可以修改。

```js
global._foo = { foo: 'world' };

const a = require('./mod.js');
console.log(a.foo);
```

上面的代码，会使得加载mod.js的脚本都失真。

为了防止这种情况出现，我们就可以使用 Symbol。

```js
// mod.js
const FOO_KEY = Symbol.for('foo');

function A() {
  this.foo = 'hello';
}

if (!global[FOO_KEY]) {
  global[FOO_KEY] = new A();
}

module.exports = global[FOO_KEY];
```

上面代码中，可以保证`global[FOO_KEY]`不会被无意间覆盖，但还是可以被改写。

```js
global[Symbol.for('foo')] = { foo: 'world' };

const a = require('./mod.js');
```

如果键名使用`Symbol`方法生成，那么外部将无法引用这个值，当然也就无法改写。

```js
// mod.js
const FOO_KEY = Symbol('foo');

// 后面代码相同 ……
```

上面代码将导致其他脚本都无法引用 `FOO_KEY`。但这样也有一个问题，就是如果多次执行这个脚本，每次得到的`FOO_KEY` 都是不一样的。虽然 Node 会将脚本执行的结果缓存起来 ，一般情况下，不会多次执行同一个脚本，但是用户可以手动清除缓存，所以也不是绝对可靠。

---

## 8. 内置的Symbol值

除了定义自己使用的Symbol值以外，ES6还提供了11个内置的Symbol值，指向语言内部使用的方法。

### Symbol.hasInstance

对象的`Symbol.hasInstance` 属性，指向一个内部方法。当其他对象使用`instanceof`运算符，判断是否为该对象的实例时，会调用这个方法。比如，`foo instanceof Foo` 在语言内部，实际调用的是`Foo[Symbol.hasInstance](foo)`。

```js
class MyClass {
  [Symbol.hasInstance](foo) {
    return foo instanceof Array;
  }
}

[1, 2, 3] instanceof new MyClass()  // true
```

上面代码中，`MyClass` 是一个类，`new MyClass()` 会返回一个实例。该实例的`Symbol.hasInstance` 方法，会在进行 `instanceof` 运算时自动调用，判断左侧的运算是否为 `Array`的实例。

下面是另一个例子。

```js
class Even {
  static [Symbol.hasInstance](obj) {
    return Number(obj) % 2 === 0;
  }
}

// 等同于
const Even = {
  [Symbol.hasInstanceof] (obj) {
    return Number(obj) % 2 === 0;
  }
}

1 instanceof Even // false
2 instanceof Even // true
12345 instanceof Even // false
```

### Symbol.iterator

对象的 `Symbol.iterator` 属性，指向该对象的默认遍历器方法。

```js
const myIterable = {};

myIterable[Symbol.iterator] = function* () {
  yield 1;
  yield 2;
  yield 3;
};

[...myIterable] // [1, 2, 3]
```

对象进行`for...of`循环时，会调用`Symbol.iterator`方法，返回该对象的默认遍历器。

```js
class Collection {
  *[Symbol.iterator]() {
    let i = 0;
    while(this[i] !== undefined) {
      yield this[i];
      ++i;
    }
  }
}

let myCollection = new Collection();
myCollection[0] = 1;
myCollection[1] = 2;

for(let value of myCollection) {
  console.log(value)
}

// 1
// 2
```