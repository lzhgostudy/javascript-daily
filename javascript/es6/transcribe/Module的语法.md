
# Module 的语法

## 1. 概述

历史上，JavaScript一直没有模块体系，无法将一个大程序拆分成互相依赖的小文件，再用简单的方法拼装起来。其他语言都有这个功能，比如 Ruby的 `require`, Python的`import`，甚至就连 CSS 都有`@import`，但是Javascript任何这方面的支持都没有，对开发大型的，复杂的项目形成了巨大的障碍。

在ES6 之前，社区制定了一些模块加载方案，最主要的有 CommomJS 和 AMD 两种。前者用于服务器，后者用于浏览器。ES6 在语言标准的层面上，实现了模块功能，而且实现的相当简单，完全可以取代 CommonJS 和 AMD 规范，成为浏览器和服务器通用的模块解决方案。

ES6 模块的设计思想是尽量静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS 和 AMD 模块，都只能在运行时确定这些东西。比如，CommonJS模块就是对象，输入时必须查找对象属性。

```js
// CommonJS模块
let { stat, exists, readfile } = require('fs');

// 等同于
let _fs = require('fs');
let stat = _fs.stat;
let exists = _fs.exists;
let readfile = _fs.readfile;
```

上面代码的实质是整体加载 `fs` 模块（即加载 `fs` 的所有方法），生成一个对象 `_fs`，然后再从这个对象上面读取3个方法。这种加载称为 “运行时加载”，因为只要运行时才能得到这个对象，导致完全没办法在编译时做 “静态优化”。

ES6 模块不是对象，而是通过 `export` 命令显式指定输出的代码，再通过 `import` 命令输入。

```js
// ES6 模块
import { stat, exists, readFile } from 'fs';
```

上面代码的实质是从 `fs` 模块加载 3 个方法，其他方法不加载。这种加载称为“编译时加载”或者 静态加载，即 ES6 可以在编译时就完成模块加载，效率要比 CommomJS模块的加载方式高。当然，这也导致了没法引用ES6模块本身，因为它不是对象。

由于ES6模块是编译时加载，使得静态分析成为可能。有了它，就能进一步拓宽Javascript的语法，比如引入宏(macro)和类型检验(type system)这些只能靠静态分析实现的功能。

除了静态加载带来的各种好处，ES6 模块还有以下好处。

- 不再需要 `UMD` 模块格式了，将来服务器和浏览器都会支持 ES6 模块格式。目前，通过各种工具库，其实已经做到了这一点。
- 将来浏览器的新API就能用模块格式提供，不再必须做成全局变量或者 `navigator` 对象的属性。
- 不再需要对象作为命名空间（比如 `Math` 对象），未来这些功能可以通过模块提供。

## 2. 严格模式

ES6 的模块自动采用严格模式，不管你有没有在模块头部加上 `"use strict"`

严格模式主要有以下限制。

- 变量必须声明后再使用
- 函数的参数不能有同名属性，否则报错
- 不能使用 `with` 语句
- 不能对只读属性赋值，否则报错
- 不能使用前缀 0 表示八进制数，否则报错
- 不能删除不可删除的属性，否则报错
- 不能删除变量 `delete prop`，会报错，只能删除属性 `delete global[prop]`
- `eval` 不会在它的外层作用域引入变量
- `eval` 和 `arguments` 不能被重复赋值
- `arguments` 不会自动反映函数参数变化
- 不能使用 `arguments.callee`
- 不能使用 `arguments.caller`
- 禁止 `this` 指向全局对象
- 不能使用 `fn.caller` 和 `fn.arguments` 获取函数调用的堆栈
- 增加了保留字（比如：`protected, static, interface`)

其中，尤其需要注意 `this` 的限制。ES6模块中，顶层的 `this` 指向 `undefined` ，即不应该在顶层代码使用 `this` 。

## 3. export 命令

模块功能主要有两个命令构成：`export` 和 `import`。`export` 命令用于规定模块的对外接口，

## 4. import 命令

使用 `export` 命令定义了模块的对外接口以后，其他JS文件可以通过 `import` 命令加载这个模块。

```js
// main.js
import { firstName, lastName, year } from './profile.js';

function setName(element) {
  element.textContent = firstName + ' ' + lastName;
}
```

上面代码的 `import` 命令，用于加载 `profile.js` 文件，并从中输入变量。 `import` 命令接受一对大括号，里面指定从其他模块导入的变量名。大括号里面的变量名，必须与被导入模块 (`profile.js`)对外接口的名称相同。

如果想为输入的变量重新去一个名字， `import` 命令要使用 `as` 关键字，将输入的变量重命名。

```js
import { lastName as surname } from './profile.js';
```

`import` 命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口。

```js
import {a} from './xxx.js'
a = {} // Syntax Error : 'a' is read-only;
```

上面代码中，脚本加载了变量a，对其重新赋值就会报错，因为a是一个只读的接口。但是如果 `a `是一个对象，改写`a`的属性是允许的。

```js
import {a} from './xxx.js'

a.foo = 'hello'; // 合法操作
```

上面代码中，`a` 的属性可以成功改写，并且其他模块也可以督导改写后的值。不过，这种写法很难查错，建议凡是输入的变量，都当做只读，不要轻易改变它的属性。

`import` 后面的 `from` 指定模块文件的位置，可以是相对路径，也可以是绝对路径。如果不带有路径，只是一个模块名，那么必须有配置文件，告诉Javascript 引擎模块的位置

```js
import { myMethod } from 'util';
```

上面代码中，`util` 是模块文件名，由于不带有路径，必须通过配置，告诉引擎怎么取到这个模块。

注意，`import` 命令具有提升效果，会提升到整个模块的头部，首先执行。

```js
foo();

import {foo} from "my_module";
```

上面的代码不会报错，因为 `import` 的执行早于 `foo` 的调用。这种行为的本质是 `import` 命令是编译阶段执行的，在代码运行之前。

由于 `import` 是静态执行的，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。

```js
// 报错
import { 'f' + 'oo' } from 'my_module';

// 报错
let module = 'my_module';
import { foo } from module;

// 报错
if (x === 1) {
  import { foo } from 'module1';
} else {
  import { foo } from 'module2';
}
```
上面三种写法都会报错，因为它们用到了表达式、变量和if结构。在静态分析阶段，这些语法都是没法得到值的。

最后， `import` 语句会执行所加载的模块，因此可以有下面的写法。

```js
import `lodash`
```

上面代码仅仅执行 `lodash` 模块，但是不会输入任何值。

如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。

```js
import 'lodash';
import 'lodash';
```

上面代码加载了两次lodash，但是只会执行一次。

```js
import { foo } from 'my_module';
import { bar } from 'my_module';

// 等同于
import { foo, bar } from 'my_module';
```

上面代码中，虽然foo和bar在两个语句中加载，但是它们对应的是同一个my_module模块。也就是说，import语句是 Singleton 模式。

目前阶段，通过 Babel转码，CommonJS模块的 `require` 命令和ES6模块的 `import` 命令，可以写在同一个模块里面，但是最好不要这样做。因为 `import` 在静态解析阶段执行，所以它是一个模块之中最早执行的。下面的代码可能不会得到预期结果。

```js
require('core-js/modules/es6.symbol');
require('core-js/modules/es6.promise');
import React from 'React';
```

