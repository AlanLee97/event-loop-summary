const p1 = new Promise((resolve) => {
  setTimeout(() => {
    resolve('resolve3');
    console.log('timer1');
  }, 0);
  resolve('resolve1');
  resolve('resolve2');
}).then((res) => {
  console.log(res);
  setTimeout(() => {
    console.log(p1); // resolve('resolve1')已经resolve了，resolve('resolve3')的时候就为undefined了
  }, 1000);
}).finally((res) => {
  console.log('finally: ', res);
})

/**
  执行顺序：
    * 'resolve1'
    * 'finally: undefined'
    * 'timer1'
    * 'Promise { <fullfilled> undefined }' 
*/
