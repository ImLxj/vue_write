import { newArrayProto } from "./array";
import Dep from "./dep";
class Observe {
  constructor(data) {
    Object.defineProperty(data, "__ob__", {
      value: this,
      enumerable: false, // 不可枚举
    });
    //data.__ob__ = this // 这种方式会造成死循环
    if (Array.isArray(data)) {
      data.__proto__ = newArrayProto;
      this.observeArray(data);
    } else {
      // 判断data
      this.walk(data);
    }
  }
  // 循环对象， 重新定义属性
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  observeArray(data) {
    // 观测数组, 如果数组当中含有对象,则对对象也进行劫持
    data.forEach((item) => observe(item));
  }
}

// 对象劫持
function defineReactive(target, key, value) {
  observe(value); // 如果还有对象嵌套对象 则进行递归
  let dep = new Dep() // 为每一个属性都增加一个dep收集器
  Object.defineProperty(target, key, {
    get() {
      // 如果dep.target存在 就将当前实例上的watcher放到dep身上
      if(Dep.target) {
        dep.depend()  // 这个就是让收集器记住当前watcher
      }
      return value;
    },
    set(newValue) {
      if (newValue === value) return;
      observe(newValue); // 如果传递过来的是一个对象，则再次代理
      value = newValue;
      dep.notify() // 通知更新
    },
  });
}

export function observe(data) {
  // 对对象进行劫持
  if (typeof data !== "object" || data == null) {
    return;
  }
  return new Observe(data);
}
