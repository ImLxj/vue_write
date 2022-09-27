import { initMixin } from "./init";
import { initLifecycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options) {
  // 选项初始化
  this._init(options);
}
Vue.prototype.$nextTick = nextTick;
initMixin(Vue);
initLifecycle(Vue);

export default Vue;
