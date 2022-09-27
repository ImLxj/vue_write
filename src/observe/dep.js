let id = 0;
class Dep {
  constructor() {
    this.id = id++;
    this.subs = []; // 用于收集watcher
  }
  depend() {
    /**q
     * 这里我们希望有重复的watcher 如果一个属性调用两次get方法就会push进去两个相同的watcher 这样只单向的关系
     * 我们想让 dep 和 watcher 变成双向关系
     */
    // this.subs.push(Dep.target)
    Dep.target.appDep(this);
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
  notify() {
    this.subs.forEach(watcher => watcher.update())
  }
  /**
   * 一个组件上有多个 属性 一个属性有一个dep 一个dep 对应多个watcher
   * 一个组件只有一个watcher 但是组件上有多个属性也就是有多个dep
   * dep 和 watcher 是多对多的关系
   */
}
Dep.target = null; // 观察到watcher用来收集watcher

export default Dep;
