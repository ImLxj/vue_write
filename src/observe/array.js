// 获取到数组原型上的方法
let oldArrayProto = Array.prototype;

export let newArrayProto = Object.create(oldArrayProto);
// 找到所有的变异方法
let methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];

methods.forEach((method) => {
  newArrayProto[method] = function (...args) { // 重写数组的方法，因为使用Object.create() 就类似与继承父类方法
    let result = oldArrayProto[method].call(this, ...args); // 调用内部原来函数的方法
    
    let instated;
    let ob = this.__ob__
    switch(method) {
      case 'push':
        case 'unshift':
          instated = args
          break;
      case 'splice':
          instated = args.slice(2)
          break;
    }
    if(instated) {
      ob.observeArray(instated) // 将新加入进去的数据再次进行观测
    }

    return result;
  };
});
