import Watcher from "./observe/watcher";
import { createElementVNode, createTextVNode } from "./vdom";

function createElement(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === "string") {
    // 如果tag是字符串 则表示是标签
    vnode.el = document.createElement(tag); // 将真实节点和虚拟节点对应取来，
    patchProps(vnode.el, data); // 处理属性
    children.forEach((child) => {
      let el = createElement(child)
      vnode.el.appendChild(createElement(child));
    });
  } else {
    // 文本
    vnode.el = document.createTextNode(text)
  }
  return vnode.el;
}

function patchProps(el, data) {
  for (let key in data) {
    if (key === "style") {
      // style: {color: 'red'}
      for (let styleName in data[key]) {
        el.style[styleName] = data[key][styleName];
      }
    } else {
      el.setAttribute(key, data[key]);
    }
  }
}

function patch(oldNode, vnode) {
  const isRealElement = oldNode.nodeType; // 判断el是不是真实的DOM节点
  if (isRealElement) {
    let elm = oldNode; // 获取真实元素
    let parentNode = oldNode.parentNode; // 拿到父元素

    const newElm = createElement(vnode); // 通过虚拟DOM 创建真实DOM
    parentNode.insertBefore(newElm, elm.nextSibling) // 将新节点插入到老节点后面
    parentNode.removeChild(elm) // 删除老节点
    return newElm
  } else {
    // diff算法
  }
}

export function initLifecycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // 根据虚拟dom 生成真实DOM
    const vm = this;
    const el = vm.$el; // 这个el 是经过querySelector 处理的

    // patch 函数既有初始化的功能 又有更新的功能
    vm.$el = patch(el, vnode);
  };

  // _c('div', {id: 'app'}) ...
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments);
  };

  // _v(text) ...
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments);
  };

  // _s() ...
  Vue.prototype._s = function (value) {
    if (typeof value !== "object") return value;
    return JSON.stringify(value);
  };

  Vue.prototype._render = function () {
    const vm = this;
    return vm.$options.render.call(vm);
  };
}

export function mountComponent(vm, el) {
  // 这里的el是通过querySelector 处理过的。
  vm.$el = el;
  // 1. 调用render函数产生虚拟节点  虚拟DOM
  const updateComponent = () => {
    vm._update(vm._render());
  }
  const watcher = new Watcher(vm, updateComponent, true) // true 用于标识这是一个渲染watcher
  console.log(watcher);
  // 2. 根据虚拟DOM 生成真实DOM
  // 3. 将生成的真实DOM插入到el当中
}
