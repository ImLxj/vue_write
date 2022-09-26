import { compilerToFunction } from "./compiler";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

export function initMixin(Vue) {
  Vue.prototype._init = function _init(options) {
    // 用户初始化
    // 保存vue实例，通过保存的实例来对vue进行操作
    let vm = this;
    // 将用户配置挂载到 $options上
    vm.$options = options;
    // 进行状态初始化
    initState(vm);
    // 进行模板的编译
    if (options.el) {
      this.$mount(options.el); // 实现数据的挂载
    }
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el); // 获取到app根标签
    let ops = vm.$options;
    // 先找options里面有没有render函数， 如果没有render函数 就找有没有template
    if (!ops.render) {
      let template;
      if (!ops.template && el) {
        // 没有写模板，但是有el
        template = el.outerHTML;
      } else {
        // 写了模板 el也存在的时候
        if (el) {
          template = ops.template;
        }
      }
      if (template) {
        // 对模板进行编译
        const render = compilerToFunction(template);
        // 这就拿到了render函数
        /**
         * ƒ anonymous() {
            with(this){
              return 
              _c('div',{id:"app",style:{"background-color":" red"}},
              _v(_s(name)+"helloworld"+_s(age)),
              _c('span',null),
              _v("vue"))
            }
          }
         */
        ops.render = render  // jsx 最终会编译成 h('xxxx')
      }
    }
    mountComponent(vm, el)
  };
}
