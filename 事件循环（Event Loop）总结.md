

# 事件循环
事件循环是一个在JS引擎中**等待任务**、**执行任务**、**休眠**这三个状态中进行无线循环转换的过程。<br />​

因JavaScript是单线程的语言，在执行耗时任务时会阻塞主线程，为了能够执行后面的代码，JavaScript引入了异步任务，以减少阻塞情况。事件循环机制很好的实现了JavaScript的异步任务。<br />​<br />
# 思维导图
# 浏览器事件循环
事件循环是一个在JS引擎中**等待任务**、**执行任务**、**休眠**这三个状态中进行无线循环转换的过程。<br />以下为事件循环执行流程：<br />​<br />

1. JS引擎等待任务（**宏任务**），当有任务时
- 执行队列中第1个任务
   - 如果执行任务中出现**微任务**，则排入微任务队列，执行完微任务队列中的任务才执行下一步
   - 执行渲染，如果有。
- 如果下一个任务到来时，上一个任务还没执行完，则任务会放到一个队列中进行等待
2. 执行完任务，进入休眠状态，转入第1步。

​

整体事件循环示意图如下：<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/743297/1632065997339-37b3b21f-4581-4e6e-8776-666c4af4f48d.png#clientId=u6a429825-c993-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=624&id=u6744e03c&margin=%5Bobject%20Object%5D&name=image.png&originHeight=402&originWidth=477&originalType=binary&ratio=1&rotation=0&showTitle=false&size=16575&status=done&style=none&taskId=u2f91db53-1e5d-4f37-8758-492327ccbff&title=&width=740.5)
## 宏任务

- script
- setTimeout
- setInterval
- requestAnimationFrame
- postMessage
- 鼠标事件
- UI渲染
- ...
> 每个宏任务之后，引擎会立即执行微任务队列中的所有任务，然后再执行下一个宏任务，或渲染，或进行其他任何操作。

## 微任务

- Promise的then/catch/finally方法中
- MutationObserver
> 微任务会在执行任何其他事件处理，或渲染，或执行任何其他宏任务之前完成。

​<br />
## 实例分析
**示例1**
```javascript
setTimeout(() => alert("timeout"));

Promise.resolve()
  .then(() => alert("promise"));

alert("code");

// 输出
// code
// promise
// timeout
```
这里的执行顺序是怎样的？

1. code 首先显示，因为它是常规的同步调用。
1. promise 第二个出现，因为 then 会通过微任务队列，并在当前代码之后执行。
1. timeout 最后显示，因为它是一个宏任务。

​

**实例2**
```javascript
Promise.resolve().then(()=>{
  console.log('Promise1')
  setTimeout(()=>{
    console.log('setTimeout2')
  },0)
})
setTimeout(()=>{
  console.log('setTimeout1')
  Promise.resolve().then(()=>{
    console.log('Promise2')
  })
},0)

// 输出结果
// Promise1
// setTimeout1
// Promise2
// setTimeout2
```

- 一开始执行栈的同步任务（这属于宏任务）执行完毕，会去查看是否有微任务队列，上题中存在(有且只有一个)，然后执行微任务队列中的所有任务输出 Promise1，同时会生成一个宏任务 setTimeout2
- 然后去查看宏任务队列，宏任务 setTimeout1 在 setTimeout2 之前，先执行宏任务 setTimeout1，输出 setTimeout1
- 在执行宏任务 setTimeout1 时会生成微任务 Promise2 ，放入微任务队列中，接着先去清空微任务队列中的所有任务，输出 Promise2
- 清空完微任务队列中的所有任务后，就又会去宏任务队列取一个，这回执行的是 setTimeout2

​

**实例3**<br />async/await执行顺序
```javascript
console.log('script start')

async function async1() {
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 end')
}
async1()

setTimeout(function () {
  console.log('setTimeout')
}, 0)

new Promise(resolve => {
  console.log('Promise')
  resolve()
}).then(function () {
  console.log('promise1')
}).then(function () {
  console.log('promise2')
})

console.log('script end')
// async/await执行顺序
// script start => async2 end => Promise => script end => async1 end => promise1 => promise2 => setTimeout

// 旧版输出如下
// script start => async2 end => Promise => script end => promise1 => promise2 => async1 end => setTimeout
```
**新版chrome**

1. 执行script代码，为第一个宏任务，执行宏任务的代码，输出script start。（此时宏任务队列：[script]）
1. 执行async1()，会调用async2()，然后输出async2 end，await之后的代码将注册为一个微任务，相当于Promise.resolve().then(() => console.log('async1 end'))（此时微任务队列：[async1 end]）
1. 遇到setTimeout，产生一个宏任务，排进宏任务队列（此时宏任务队列：[script, setTimeout]）
1. 执行Promise，输出Promise（new Promise属于同步代码）。遇到then，产生一个微任务（此时微任务队列：[async1 end, promise1]）
1. 继续执行代码，输出script end（同步代码）
1. 代码逻辑执行完毕(当前宏任务执行完毕，此时宏任务队列：[setTimeout])，开始执行当前宏任务(script)产生的微任务队列，输出async1 end，promise1（此时微任务队列：[]），微任务promise1遇到then，产生一个新的微任务（此时微任务队列：[promise2]）
1. 执行产生的微任务，输出promise2,当前微任务队列执行完毕（此时微任务队列：[]）
1. 最后，执行下一个宏任务，即执行setTimeout，输出setTimeout


<br />**旧版chrome**

- 执行代码，输出script start。
- 执行async1(),会调用async2(),然后输出async2 end,此时将会保留async1函数的上下文，然后跳出async1函数。
- 遇到setTimeout，产生一个宏任务
- 执行Promise，输出Promise。遇到then，产生第一个微任务
- 继续执行代码，输出script end
- 代码逻辑执行完毕(当前宏任务执行完毕)，开始执行当前宏任务产生的微任务队列，输出promise1，该微任务遇到then，产生一个新的微任务
- 执行产生的微任务，输出promise2,当前微任务队列执行完毕。执行权回到async1
- 执行await,实际上会产生一个promise返回，即
   - let promise_ = new Promise((resolve,reject){ resolve(undefined)}) 
   - 执行完成，执行await后面的语句，输出async1 end
- 最后，执行下一个宏任务，即执行setTimeout，输出setTimeout


<br />**实例4**
```javascript
console.log('script start');

setTimeout(function() {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

console.log('script end');

// 输出结果
// script start
// script end
// promise1
// promise2
// setTimeout
```
同步代码：

- `console.log('script start');` 
- `console.log('script end');`

script 宏任务：

- 宏任务 `setTimeout`
- 微任务 `.then(promise1)`

所以先执行同步代码，先输出：script start -> script end。<br />然后调用微任务，输出 promise1，将 then(promise2) 放入微任务。<br />再次调用微任务，将 promise2 输出。<br />最后调用宏任务 setTimeout，输出 setTimeout。<br />​

**实例5**
```javascript
Promise.resolve().then(function promise1() {
  console.log('promise1');
})

setTimeout(function setTimeout1() {
  console.log('setTimeout1')
  Promise.resolve().then(function promise2() {
    console.log('promise2');
  })
}, 0)

setTimeout(function setTimeout2() {
  console.log('setTimeout2')
}, 0)

// 输出结果
// promise1
// setTimeout1
// promise2
// setTimeout2

```
script 宏任务下：

- 同步任务：无
- 微任务：Promise.then(promise1)
- 宏任务：setTimeout(setTimeout1)、setTimeout(setTimeout2)

所以先走同步任务，发现并没有，不理会。<br />然后再走微任务 Promise.then(promise1)，输出 promise1。<br />接着推出宏任务，先走 setTimeout(setTimeout1)：

- 同步任务：console.log('setTimeout1')
- 微任务：Promise.then(promise2)
- 宏任务：setTimeout(setTimeout2)（注意这里的宏任务是整体的）

所以先走同步任务，输出 setTimeout1。<br />接着走微任务，输出 promise2。<br />然后推出宏任务 setTimeout(setTimeout2)。<br />setTimeout(setTimeout2) 环境下的微任务和宏任务都没有，所以走完同步任务，输出 setTimeout2，就结束了。<br />​

**实例6**
```javascript
setTimeout(function() {
  console.log(4);
}, 0);

const promise = new Promise((resolve) => {
  console.log(1);
  for (var i = 0; i < 10000; i++) {
    i == 9999 && resolve();
  }
  console.log(2);
}).then(function() {
  console.log(5);
});

console.log(3);


// 输出结果
// 1
// 2
// 3
// 5
// 4

```
script 下：

- 同步任务：console.log(1)、console.log(2)、console.log(3)。
- 微任务：Promise.then()（等到 9999 再添加进来）
- 宏任务 setTimeout

所以先走同步任务，注意当我们 new Promsie() 的时候，内部的代码会执行的，跟同步任务一样的，而 .then() 在 resolve() 的情况下才会添加到微任务。<br />因此先输出 1 -> 2 -> 3。<br />然后推出微任务 Promise.then()，所以输出 5。<br />最后推出宏任务 setTimeout，输出 4。

**实例7**
```javascript
setTimeout(function () {
  console.log('timeout1');
}, 1000);

console.log('start');

Promise.resolve().then(function () {
  console.log('promise1');
  Promise.resolve().then(function () {
    console.log('promise2');
  });
  setTimeout(function () {
    Promise.resolve().then(function () {
      console.log('promise3');
    });
    console.log('timeout2')
  }, 0);
});

console.log('done');

// 输出结果
// start
// done
// promise1
// promise2
// timeout2
// promise3
// timeout1

```
**​**

**实例8**
```javascript
console.log("script start");

setTimeout(function() {
  console.log("setTimeout---0");
}, 0);

setTimeout(function() {
  console.log("setTimeout---200");
  setTimeout(function() {
    console.log("inner-setTimeout---0");
  });
  Promise.resolve().then(function() {
    console.log("promise5");
  });
}, 200);

Promise.resolve()
.then(function() {
  console.log("promise1");
})
.then(function() {
  console.log("promise2");
});

Promise.resolve().then(function() {
  console.log("promise3");
});

console.log("script end");

// 输出结果
// script start
// script end
// promise1
// promise3
// promise2
// setTimeout---0
// setTimeout---200
// promise5
// inner-setTimeout---0
```
**实例9**
```javascript
console.log(1);

setTimeout(() => {
  console.log(2);

  new Promise((resolve) => {
    console.log(3);
  }).then(() => {
    console.log(4);
  });
}, 200);

new Promise((resolve) => {
  console.log(5);
  resolve();
}).then(() => {
  console.log(6);
});

setTimeout(() => {
  console.log(7);
}, 0);

setTimeout(() => {
  console.log(8);

  new Promise(function (resolve) {
    console.log(9);
    resolve();
  }).then(() => {
    console.log(10);
  });
}, 100);

new Promise(function (resolve) {
  console.log(11);
  resolve();
}).then(() => {
  console.log(12);
});

console.log(13);

// 输出结果
// 1
// 5
// 11
// 13
// 6
// 12
// 7
// 8
// 9
// 10
// 2
// 3

```

<br />**示例10**
```javascript
const p = new Promise((resolve, reject) => {
  console.log('before resolve');
  resolve(1);
  console.log('after resolve');

  console.log('before reject');
  reject(2);
  reject(3);
  console.log('after reject');
  resolve(4);
});

p.then(res => {
  console.log('promise result', res);
}).catch(err => {
  console.log('promise result err', err);
})


// 输出结果
// before resolve
// after resolve
// before reject
// after reject
// promise result 1
```
分析：遇到执行多个resolve或reject时，只执行第一个，但是同步代码还会继续执行
# Node事件循环
node事件循环结构图<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/743297/1638925246299-6f82edbd-70f9-4c18-a74c-a9f41c9c6b8b.png#clientId=u10e81a21-adf6-4&crop=0&crop=0&crop=1&crop=1&from=paste&height=456&id=udbdf37fc&margin=%5Bobject%20Object%5D&name=image.png&originHeight=456&originWidth=760&originalType=binary&ratio=1&rotation=0&showTitle=false&size=5050&status=done&style=none&taskId=udd319f79-d57b-452b-a2aa-b33727e3005&title=&width=760)
> 每个框将被称为事件循环的“阶段”。

## 事件循环阶段

- timers，定时器阶段，执行setTimeout和setInterval的回调
- pending callbacks，等待回调阶段，执行延迟到下一次循环的回调
- idle, prepare，空闲阶段，仅在内部调用
- poll，轮询阶段
   - 检索新的I/O事件；
   - 执行I/O相关回调（不包括timers、close callbacks阶段和setImmediate的回调）
   - 结点可能会阻塞在这里
- check，检查阶段，执行setImmediate的回调
- close callbacks，关闭回调阶段，执行相关关闭的回调，例如socket.on('close', () => {...})

​

### **setImmediate和process.nextTick的区别**

- **setImmediate**

在一次事件循环结束之后执行setImmediate
> 与setTimeout的区别是，setTimeout是指定的时间到了就执行

​<br />

- **process.nextTick**

在下一个宏任务之前执行
> 与setImmediate的区别是，setImmediate在一次事件循环结束之后执行

​<br />
## Node中的宏任务

- IO操作
- setTimeout
- setInterval
- setImmediate
- ...
## Node中的微任务

- Promise的then/catch/finally
- process.nextTick



## Node 版本差异说明
这里主要说明的是 node11 前后的差异，因为 node11 之后一些特性已经向浏览器看齐了，总的变化一句话来说就是，如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行对应的微任务队列，一起来看看吧～
### timers 阶段的执行时机变化
```javascript
setTimeout(()=>{
    console.log('timer1')
    Promise.resolve().then(function() {
        console.log('promise1')
    })
}, 0)
setTimeout(()=>{
    console.log('timer2')
    Promise.resolve().then(function() {
        console.log('promise2')
    })
}, 0)

```

- 如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行微任务队列，这就跟浏览器端运行一致，最后的结果为timer1=>promise1=>timer2=>promise2
- 如果是 node10 及其之前版本要看第一个定时器执行完，第二个定时器是否在完成队列中. 
   - 如果是第二个定时器还未在完成队列中，最后的结果为timer1=>promise1=>timer2=>promise2
   - 如果是第二个定时器已经在完成队列中，则最后的结果为timer1=>timer2=>promise1=>promise2
### check 阶段的执行时机变化
```javascript
setImmediate(() => console.log('immediate1'));
setImmediate(() => {
    console.log('immediate2')
    Promise.resolve().then(() => console.log('promise resolve'))
});
setImmediate(() => console.log('immediate3'));
setImmediate(() => console.log('immediate4'));

```

- 如果是 node11 后的版本，会输出immediate1=>immediate2=>promise resolve=>immediate3=>immediate4
- 如果是 node11 前的版本，会输出immediate1=>immediate2=>immediate3=>immediate4=>promise resolve
### nextTick 队列的执行时机变化
```javascript
setImmediate(() => console.log('timeout1'));
setImmediate(() => {
    console.log('timeout2')
    process.nextTick(() => console.log('next tick'))
});
setImmediate(() => console.log('timeout3'));
setImmediate(() => console.log('timeout4'));

```

- 如果是 node11 后的版本，会输出timeout1=>timeout2=>next tick=>timeout3=>timeout4
- 如果是 node11 前的版本，会输出timeout1=>timeout2=>timeout3=>timeout4=>next tick

以上几个例子，你应该就能清晰感受到它的变化了，反正记着一个结论，如果是 node11 版本一旦执行一个阶段里的一个宏任务(setTimeout,setInterval和setImmediate)就立刻执行对应的微任务队列。<br />

# Node 和 浏览器的事件循环主要区别
两者最主要的区别在于浏览器中的微任务是在每个相应的宏任务中执行的，而nodejs中的微任务是在不同阶段(timers、pending callback、idle/prepare、poll、check、close callback)之间执行的。<br />​<br />
# 参考文章
> [面试题：说说事件循环机制(满分答案来了)](https://juejin.cn/post/6844904079353708557#heading-13)
> [微任务、宏任务与Event-Loop ](https://www.cnblogs.com/jiasm/p/9482443.html)
> [浏览器与Node的事件循环(Event Loop)有何区别?](https://zhuanlan.zhihu.com/p/54882306)
> [The Node.js Event Loop, Timers, and process.nextTick()](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
> [jsliang 求职系列 - 06 - Event Loop](https://juejin.cn/post/6892164887456251918)

