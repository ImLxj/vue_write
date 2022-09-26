import { initMixin } from "./init"
import { initLifecycle } from "./lifecycle"

function Vue(options) {
  // 选项初始化
  this._init(options)
}

initMixin(Vue)
initLifecycle(Vue)

export default Vue
