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
