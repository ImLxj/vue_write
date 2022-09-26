// _c
export function createElementVNode(vm, tag, data, ...children) {
  if(data == null) {
    data = {}
  }
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(vm, tag, key, data, children);
}

// _v
export function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

// 虚拟DOM
/**
 * ast和虚拟DOM的区别就是 ast只是做了语法层面的转化， 他描述的是语法本身
 * 虚拟DOM 描述的是DOM 元素，可以增加一些自定义属性
 */
function vnode(vm, tag, key, data, children, text) {
  return {
    vm,
    tag,
    key,
    data,
    children,
    text,
  };
}
