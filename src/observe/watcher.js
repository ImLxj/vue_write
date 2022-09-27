import Dep from "./dep";

let id = 0; // 唯一标识

// 每个属性都有个一个dep(被观察者) watcher就是观察者(属性变化了 就会通知观察者来更新) => 观察者模式

class Watcher {
  // 不同的组件有不同的watcher
  constructor(vm, fn, options) {
    this.id = id++;
    this.getter = fn; // getter意味着调用这个函数可以发生取值操作。
    this.renderWatcher = options;
    this.depsId = new Set(); // dep的id 如果有重复的则进行去重
    this.deps = []; // 用于watcher 收集dep
    this.get();
  }
  appDep(dep) {
    let id = dep.id;
    // 判断当前set对象里面有没有dep的id 如果没有 就将属性的dep放到watcher里面
    if (!this.depsId.has(id)) {
      this.deps.push(dep);
      this.depsId.add(id); // 将id存入到set对象当中
      dep.addSub(this); // 此时watcher已经记住了dep 就只需要dep在记住watcher就可以了
    }
  }
  get() {
    Dep.target = this; // 将当前watcher挂载到Dep类身上
    // debugger
    this.getter(); // 回去vm身上取值
    Dep.target = null; // 在vm身上取完值之后在 将watcher收集器制空
  }
  update() {
    queueWatcher(this); // 把当前的watcher暂存起来 我们想要多次的更新操作变成一次
    // this.get() // 重新渲染
  }
  run() {
    this.get();
  }
}
export default Watcher;

let queue = []; // 存储watcher的队列
let has = {}; // 进行去重
let padding = false; // 做防抖
function flushSchedulerQueue() {
  let flushQueue = queue.slice(0);
  queue = [];
  has = {};
  padding = false;
  flushQueue.forEach((q) => q.run());
}
function queueWatcher(watcher) {
  let id = watcher.id;
  if (!has[id]) {
    queue.push(watcher);
    has[id] = id;
    // 不管我们的queueWatcher执行多少次，最终只完成一次页面刷新操作， 这样做可能会有一个问题 就是
    // 如果用户想获取新的值 但是时同步的任务 这样用户获取的就是旧的值 如果使用promise的话 他就会比定时器的优先级高
    // 所以我们想着就将setTimeout规整一下 新建一个方法来维护它
    if (!padding) {
      nextTick(flushSchedulerQueue, 0);
      padding = true;
    }
  }
}

let callback = [];
let waiting = false; // 是否等待
function flushCallback() {
  let cbs = callback.slice(0);
  waiting = false;
  callback = [];
  cbs.forEach((c) => c());
}

// nextTick 没有直接使用某个api 而是采用优雅降级的方式
// 内部采用的是 promise(ie不兼容)、MutationObserver(h5的api)、setImmediate（ie专属的）、settimeout

export function nextTick(cb) {
  callback.push(cb); // 维护nextTick的callback方法
  if (!waiting) {
    setTimeout(() => {
      flushCallback(); // 最后一起进行刷新
    }, 0);
    waiting = true;
  }
}
