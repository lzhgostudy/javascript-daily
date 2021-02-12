
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
