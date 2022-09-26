// 以下为源码的正则  对正则表达式不清楚的同学可以参考小编之前写的文章(前端进阶高薪必看 - 正则篇);
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; //匹配标签名 形如 abc-123
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //匹配特殊标签 形如 abc:234 前面的abc:可有可无
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配标签开始 形如 <abc-123 捕获里面的标签名
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束  >
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾 如 </abc-123> 捕获里面的标签名
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性  形如 id="app"

export function parseHTML(html) {
  /**
   * 通过创建栈的方式来实现树的创建
   * 比如 [div span] span的父亲就是 div
   */
  const ELEMENT_TYPE = 1; // 元素节点类型
  const TEXT_TYPE = 3; // 文本节点类型
  let stack = []; // 栈
  let currentParent = null; // 当前元素的父级
  let root = null; // 树的根节点

  function createASTElement(tag, attr) {
    return {
      tag,
      type: ELEMENT_TYPE,
      attrs: attr,
      parent: null,
      children: [],
    };
  }
  // 开始标签
  function start(tagName, attr) {
    // 如果是开始标签就开始生成 节点树
    let node = createASTElement(tagName, attr);
    // 然后当前有没有树根
    if (!root) {
      root = node;
    }
    // 判断当前元素有没有父元素, 默认是没有的
    if (currentParent) {
      node.parent = currentParent; // 给当前元素父亲赋值
      currentParent.children.push(node); // 将当前元素 赋值给父亲的children
    }
    stack.push(node); // 将树插入栈
    currentParent = node; // 以后的元素的父节点就是这个树, 每一次都不一样
  }
  // 文本内容
  function chars(text) {
    text = text.replace(/\s/g, "");
    // 将文本放入到父节点的children里面
    text &&
      currentParent.children.push({
        text,
        type: TEXT_TYPE,
        parent: currentParent,
      });
  }
  // 结束标签
  function end() {
    let node = stack.pop(); // 弹出最后一个
    currentParent = stack[stack.length - 1]; // 当前父节点指针前移一位
  }
  function advance(n) {
    html = html.substring(n); // 对匹配到的字符串进行截取
  }
  function parseStartTag() {
    const start = html.match(startTagOpen); // 匹配开始标签
    if (start) {
      let match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      // 如果不是开始标签的结束 就会一直匹配下去
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      // 如果开始标签的结束存在的话 就将他也删除
      if (end) {
        advance(end[0].length);
      }
      // 将匹配完之后的结果进行返回 然后做后续操作。
      return match;
    }
  }
  // html 标签最开始一定是一个<
  while (html) {
    // 如果indexOf 返回的值为0 则表示开始标签的 <
    // 如果indexOf 返回的值大于0 则表示文本之后的 <
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      const startTagMatch = parseStartTag(); // 开始标签的匹配结果
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      let endTagMatch = html.match(endTag);
      if (endTagMatch) {
        end(endTagMatch[1]);
        advance(endTagMatch[0].length);
        continue; // 跳过本次循环
      }
    }
    if (textEnd > 0) {
      let text = html.substring(0, textEnd); // 文本内容
      if (text) {
        chars(text);
        advance(text.length);
      }
    }
  }
  
  return root
}
