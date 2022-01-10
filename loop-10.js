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