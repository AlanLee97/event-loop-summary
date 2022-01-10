
const async1 = async() => {
  console.log('async1');
  
  setTimeout(() => {
    console.log('timer1');
  }, 2000);

  await new Promise((resolve, reject) => {
    console.log('promise1');
    // reject('rejected promise');
    resolve('resolveed promise'); // 需要resolve这个await的promise才会执行后面的代码
  })
  console.log('async1 end');
  return 'async1 success';
};

console.log('script start');

async1().then((res1) => {
  console.log('res1: ', res1);
})

console.log('script end');

Promise
.resolve(1)
.then(2)
.then(Promise.resolve(3))
.catch(4)
.then((res2) => {
  console.log('res2: ', res2);
})

setTimeout(() => {
  console.log('timer2');
}, 1000);

/**
  执行顺序：
    * 'script start'
    * 'async1'
    * 'promise1'
    * 'script end'
    * 'asyn1 end'
    * 'res1:  async1 success'
    * 'res2: 1'
    * 'timer2'
    * 'timer1'
*/
