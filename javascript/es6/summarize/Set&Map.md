
# Set

ES6 提供了新的数据结构 Set。它类似于数组，但是成员的值都是唯一的，没有重复的值。
Set 加入值时认为NaN等于自身，而精确相等运算符认为NaN不等于自身; 认为两个对象(即使是空对象)总是不相等的。

### 可以利用Set去重

（1）数组去重

```js
let array = [1, 1, 2, 3, 3, 4, 4];
Array.from(new Set(array))
```

（2）字符串去重
```js
[...new Set('aabbcc')].join('')
```

### Set实例的属性和方法

Set 结构的实例有以下属性。
- Set.prototype.constructor
- Set.prototype.size

Set实例方法分为两大类：操作方法和遍历方法。下面是操作方法
- Set.prototype.add(value)
- Set.prototype.delete(value)
- Set.prototype.has(value)
- Set.prototype.clear()

遍历操作
- Set.prototype.keys()
- Set.prototype.values()
- Set.prototype.entries()
- Set.prototype.forEach()

> Set结构没有键名，只有键值（或者说键名和键值是同一个），所以keys和values这两方法的行为完全一致。

### WeakSet

WeakSet结构与Set类似，也是不重复的值的集合。但是，它与Set有两个区别。首先，WeakSet的成员只能是对象，而不能是其他类型的值。其次，WeakSet中的对象都是弱引用，即垃圾回收机制不考虑WeakSet对该对象的引用，也就是说，如果其他对象都不再引用该对象，那么垃圾回收机制会自动回收该对象所占有的内存，不考虑该对象还存在与WeakSet之中。

这时因为垃圾回收机制依赖引用计数，如果一个值的引用次数不为0，垃圾回收机制不会释放这块内存。结束使用该值之后，有时会忘记取消引用，导致内存无法释放，进而可能会引发内存泄漏。

WeakSet里面的引用，都不计入垃圾回收机制，所以就不存在这个问题。因此，WeakSet适合临时存放一组对象，以及存放跟对象绑定的信息。只要这些对象在外部消失，它在WeakSet里面的引用就会自动消失。

由于上面的这个特点，WeakSet的成员是不适合引用的，因为它会随时消失。另外，由于WeakSet内部有多少个成员，取决于垃圾回收机制有没有运行，运行前后很可能成员个数是不一样的，而垃圾回收机制何时运行时不可预测的，因此ES6规定WeakSet不可遍历。



