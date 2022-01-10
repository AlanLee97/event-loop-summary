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