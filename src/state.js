import { observe } from "./observe";

// 状态初始化
export function initState(vm) {
  const opt = vm.$options;
  // 判断有没有data这个数据， 如果有则进行数据初始化
  if (opt.data) {
    initData(vm);
  }
}

// 数据代理
function proxy(vm, target, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[target][key];
    },
    set(newValue) {
      vm[target][key] = newValue;
    },
  });
}

// 数据初始化
function initData(vm) {
  // 获取到data数据
  let data = vm.$options.data;
  /* 进行判断 如果data是一个对象就直接赋值 如果data是个函数则执行完在赋值,要保证data的this指向需要将data的this变成当前vm */
  data = typeof data === "function" ? data.call(vm) : data;
  // 对数据做代理
  vm._data = data; // 拷贝内存地址 如果不加这一条 只是对数据进行劫持了，但是vm并访问不到数据
  // 对数据进行劫持
  observe(data);

  for (let key in data) {
    proxy(vm, "_data", key);
  }
}
