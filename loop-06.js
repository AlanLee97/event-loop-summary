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
