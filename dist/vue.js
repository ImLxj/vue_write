(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  // 以下为源码的正则  对正则表达式不清楚的同学可以参考小编之前写的文章(前端进阶高薪必看 - 正则篇);
  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; //匹配标签名 形如 abc-123

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //匹配特殊标签 形如 abc:234 前面的abc:可有可无

  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配标签开始 形如 <abc-123 捕获里面的标签名

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

  function parseHTML(html) {
    /**
     * 通过创建栈的方式来实现树的创建
     * 比如 [div span] span的父亲就是 div
     */
    var ELEMENT_TYPE = 1; // 元素节点类型

    var TEXT_TYPE = 3; // 文本节点类型

    var stack = []; // 栈

    var currentParent = null; // 当前元素的父级

    var root = null; // 树的根节点

    function createASTElement(tag, attr) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        attrs: attr,
        parent: null,
        children: []
      };
    } // 开始标签


    function start(tagName, attr) {
      // 如果是开始标签就开始生成 节点树
      var node = createASTElement(tagName, attr); // 然后当前有没有树根

      if (!root) {
        root = node;
      } // 判断当前元素有没有父元素, 默认是没有的


      if (currentParent) {
        node.parent = currentParent; // 给当前元素父亲赋值

        currentParent.children.push(node); // 将当前元素 赋值给父亲的children
      }

      stack.push(node); // 将树插入栈

      currentParent = node; // 以后的元素的父节点就是这个树, 每一次都不一样
    } // 文本内容


    function chars(text) {
      text = text.replace(/\s/g, ""); // 将文本放入到父节点的children里面

      text && currentParent.children.push({
        text: text,
        type: TEXT_TYPE,
        parent: currentParent
      });
    } // 结束标签


    function end() {
      stack.pop(); // 弹出最后一个

      currentParent = stack[stack.length - 1]; // 当前父节点指针前移一位
    }

    function advance(n) {
      html = html.substring(n); // 对匹配到的字符串进行截取
    }

    function parseStartTag() {
      var start = html.match(startTagOpen); // 匹配开始标签

      if (start) {
        var match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length); // 如果不是开始标签的结束 就会一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] || true
          });
        } // 如果开始标签的结束存在的话 就将他也删除


        if (_end) {
          advance(_end[0].length);
        } // 将匹配完之后的结果进行返回 然后做后续操作。


        return match;
      }
    } // html 标签最开始一定是一个<


    while (html) {
      // 如果indexOf 返回的值为0 则表示开始标签的 <
      // 如果indexOf 返回的值大于0 则表示文本之后的 <
      var textEnd = html.indexOf("<");

      if (textEnd === 0) {
        var startTagMatch = parseStartTag(); // 开始标签的匹配结果

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue; // 跳过本次循环
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    }

    return root;
  }

  function genProps(attrs) {
    var str = ""; //{name: value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        (function () {
          var obj = {};
          attr.value.split(";").forEach(function (item) {
            var _item$split = item.split(":"),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  } // 截取孩子


  function genChildren(children) {
    // 将获取到的孩子转换为逗号隔开的字符串
    return children.map(function (child) {
      return gen(child);
    }).join(",");
  } // 截取文本


  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      var text = node.text; // 如果匹配的不是{{ xxx }} 这种形式 则返回 _v('text')

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 如果匹配的有 {{ xxx }} 这种形式 则 返回 _v(_s('name') + 'xxx')这种形式
        var tokens = [];
        var match;
        defaultTagRE.lastIndex = 0; // 每次匹配之前进行重置

        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index; // 匹配的位置
          // 判断 匹配的位置和 上一次匹配的位置, 如果上一次匹配的位置比当前匹配的位置要小 就将中间的字符串截取出来

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(lastIndex));
        }

        return "_v(".concat(tokens.join("+"), ")");
      }
    }
  } // 拼接字符串


  function codegen(ast) {
    /**
     * _c('div',{id: 'app'}, _c('span', )) 这种格式
     */
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',\n    ").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : null, "\n    ").concat(ast.children.length > 0 ? ",".concat(children) : "null", ")");
    return code;
  }

  function compilerToFunction(template) {
    // 1、将template 转换成 ast语法树
    var ast = parseHTML(template); // 2、生成render 方法（render 执行后返回的结果就是 虚拟DOM）

    var code = codegen(ast); // 模板编译的原理 就是 with + new Function

    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    return render;
  }

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++;
      this.subs = []; // 用于收集watcher
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        /**q
         * 这里我们希望有重复的watcher 如果一个属性调用两次get方法就会push进去两个相同的watcher 这样只单向的关系
         * 我们想让 dep 和 watcher 变成双向关系
         */
        // this.subs.push(Dep.target)
        Dep.target.appDep(this);
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
      /**
       * 一个组件上有多个 属性 一个属性有一个dep 一个dep 对应多个watcher
       * 一个组件只有一个watcher 但是组件上有多个属性也就是有多个dep
       * dep 和 watcher 是多对多的关系
       */

    }]);

    return Dep;
  }();

  Dep.target = null; // 观察到watcher用来收集watcher

  var id = 0; // 唯一标识
  // 每个属性都有个一个dep(被观察者) watcher就是观察者(属性变化了 就会通知观察者来更新) => 观察者模式

  var Watcher = /*#__PURE__*/function () {
    // 不同的组件有不同的watcher
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.getter = fn; // getter意味着调用这个函数可以发生取值操作。

      this.renderWatcher = options;
      this.depsId = new Set(); // dep的id 如果有重复的则进行去重

      this.deps = []; // 用于watcher 收集dep

      this.get();
    }

    _createClass(Watcher, [{
      key: "appDep",
      value: function appDep(dep) {
        var id = dep.id; // 判断当前set对象里面有没有dep的id 如果没有 就将属性的dep放到watcher里面

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id); // 将id存入到set对象当中

          dep.addSub(this); // 此时watcher已经记住了dep 就只需要dep在记住watcher就可以了
        }
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this; // 将当前watcher挂载到Dep类身上
        // debugger

        this.getter(); // 回去vm身上取值

        Dep.target = null; // 在vm身上取完值之后在 将watcher收集器制空
      }
    }, {
      key: "update",
      value: function update() {
        queueWatcher(this); // 把当前的watcher暂存起来 我们想要多次的更新操作变成一次
        // this.get() // 重新渲染
      }
    }, {
      key: "run",
      value: function run() {
        this.get();
      }
    }]);

    return Watcher;
  }();
  var queue = []; // 存储watcher的队列

  var has = {}; // 进行去重

  var padding = false; // 做防抖

  function flushSchedulerQueue() {
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    padding = false;
    flushQueue.forEach(function (q) {
      return q.run();
    });
  }

  function queueWatcher(watcher) {
    var id = watcher.id;

    if (!has[id]) {
      queue.push(watcher);
      has[id] = id; // 不管我们的queueWatcher执行多少次，最终只完成一次页面刷新操作， 这样做可能会有一个问题 就是
      // 如果用户想获取新的值 但是时同步的任务 这样用户获取的就是旧的值 如果使用promise的话 他就会比定时器的优先级高
      // 所以我们想着就将setTimeout规整一下 新建一个方法来维护它

      if (!padding) {
        nextTick(flushSchedulerQueue);
        padding = true;
      }
    }
  }

  var callback = [];
  var waiting = false; // 是否等待

  function flushCallback() {
    var cbs = callback.slice(0);
    waiting = false;
    callback = [];
    cbs.forEach(function (c) {
      return c();
    });
  } // nextTick 没有直接使用某个api 而是采用优雅降级的方式
  // 内部采用的是 promise(ie不兼容)、MutationObserver(h5的api)、setImmediate（ie专属的）、settimeout


  function nextTick(cb) {
    callback.push(cb); // 维护nextTick的callback方法

    if (!waiting) {
      setTimeout(function () {
        flushCallback(); // 最后一起进行刷新
      }, 0);
      waiting = true;
    }
  }

  // _c
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  } // 虚拟DOM

  /**
   * ast和虚拟DOM的区别就是 ast只是做了语法层面的转化， 他描述的是语法本身
   * 虚拟DOM 描述的是DOM 元素，可以增加一些自定义属性
   */

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  function createElement(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === "string") {
      // 如果tag是字符串 则表示是标签
      vnode.el = document.createElement(tag); // 将真实节点和虚拟节点对应取来，

      patchProps(vnode.el, data); // 处理属性

      children.forEach(function (child) {
        createElement(child);
        vnode.el.appendChild(createElement(child));
      });
    } else {
      // 文本
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function patchProps(el, data) {
    for (var key in data) {
      if (key === "style") {
        // style: {color: 'red'}
        for (var styleName in data[key]) {
          el.style[styleName] = data[key][styleName];
        }
      } else {
        el.setAttribute(key, data[key]);
      }
    }
  }

  function patch(oldNode, vnode) {
    var isRealElement = oldNode.nodeType; // 判断el是不是真实的DOM节点

    if (isRealElement) {
      var elm = oldNode; // 获取真实元素

      var parentNode = oldNode.parentNode; // 拿到父元素

      var newElm = createElement(vnode); // 通过虚拟DOM 创建真实DOM

      parentNode.insertBefore(newElm, elm.nextSibling); // 将新节点插入到老节点后面

      parentNode.removeChild(elm); // 删除老节点

      return newElm;
    }
  }

  function initLifecycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // 根据虚拟dom 生成真实DOM
      var vm = this;
      var el = vm.$el; // 这个el 是经过querySelector 处理的
      // patch 函数既有初始化的功能 又有更新的功能

      vm.$el = patch(el, vnode);
    }; // _c('div', {id: 'app'}) ...


    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _v(text) ...


    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    }; // _s() ...


    Vue.prototype._s = function (value) {
      if (_typeof(value) !== "object") return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      var vm = this;
      return vm.$options.render.call(vm);
    };
  }
  function mountComponent(vm, el) {
    // 这里的el是通过querySelector 处理过的。
    vm.$el = el; // 1. 调用render函数产生虚拟节点  虚拟DOM

    var updateComponent = function updateComponent() {
      vm._update(vm._render());
    };

    var watcher = new Watcher(vm, updateComponent, true); // true 用于标识这是一个渲染watcher

    console.log(watcher); // 2. 根据虚拟DOM 生成真实DOM
    // 3. 将生成的真实DOM插入到el当中
  }

  // 获取到数组原型上的方法
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto); // 找到所有的变异方法

  var methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      // 重写数组的方法，因为使用Object.create() 就类似与继承父类方法
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 调用内部原来函数的方法


      var instated;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          instated = args;
          break;

        case 'splice':
          instated = args.slice(2);
          break;
      }

      if (instated) {
        ob.observeArray(instated); // 将新加入进去的数据再次进行观测
      }

      return result;
    };
  });

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      Object.defineProperty(data, "__ob__", {
        value: this,
        enumerable: false // 不可枚举

      }); //data.__ob__ = this // 这种方式会造成死循环

      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observeArray(data);
      } else {
        // 判断data
        this.walk(data);
      }
    } // 循环对象， 重新定义属性


    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "observeArray",
      value: function observeArray(data) {
        // 观测数组, 如果数组当中含有对象,则对对象也进行劫持
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observe;
  }(); // 对象劫持


  function defineReactive(target, key, value) {
    observe(value); // 如果还有对象嵌套对象 则进行递归

    var dep = new Dep(); // 为每一个属性都增加一个dep收集器

    Object.defineProperty(target, key, {
      get: function get() {
        // 如果dep.target存在 就将当前实例上的watcher放到dep身上
        if (Dep.target) {
          dep.depend(); // 这个就是让收集器记住当前watcher
        }

        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue); // 如果传递过来的是一个对象，则再次代理

        value = newValue;
        dep.notify(); // 通知更新
      }
    });
  }

  function observe(data) {
    // 对对象进行劫持
    if (_typeof(data) !== "object" || data == null) {
      return;
    }

    return new Observe(data);
  }

  function initState(vm) {
    var opt = vm.$options; // 判断有没有data这个数据， 如果有则进行数据初始化

    if (opt.data) {
      initData(vm);
    }
  } // 数据代理

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  } // 数据初始化


  function initData(vm) {
    // 获取到data数据
    var data = vm.$options.data;
    /* 进行判断 如果data是一个对象就直接赋值 如果data是个函数则执行完在赋值,要保证data的this指向需要将data的this变成当前vm */

    data = typeof data === "function" ? data.call(vm) : data; // 对数据做代理

    vm._data = data; // 拷贝内存地址 如果不加这一条 只是对数据进行劫持了，但是vm并访问不到数据
    // 对数据进行劫持

    observe(data);

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  function initMixin(Vue) {
    Vue.prototype._init = function _init(options) {
      // 用户初始化
      // 保存vue实例，通过保存的实例来对vue进行操作
      var vm = this; // 将用户配置挂载到 $options上

      vm.$options = options; // 进行状态初始化

      initState(vm); // 进行模板的编译

      if (options.el) {
        this.$mount(options.el); // 实现数据的挂载
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el); // 获取到app根标签

      var ops = vm.$options; // 先找options里面有没有render函数， 如果没有render函数 就找有没有template

      if (!ops.render) {
        var template;

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
          var render = compilerToFunction(template); // 这就拿到了render函数

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

          ops.render = render; // jsx 最终会编译成 h('xxxx')
        }
      }

      mountComponent(vm, el);
    };
  }

  function Vue(options) {
    // 选项初始化
    this._init(options);
  }

  Vue.prototype.$nextTick = nextTick;
  initMixin(Vue);
  initLifecycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
