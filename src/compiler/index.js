import { parseHTML } from "./parse";

// 截取属性
function genProps(attrs) {
  let str = ""; //{name: value}
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

// 截取孩子
function genChildren(children) {
  // 将获取到的孩子转换为逗号隔开的字符串
  return children.map((child) => gen(child)).join(",");
}

// 截取文本
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node) {
  if (node.type === 1) {
    return codegen(node);
  } else {
    let text = node.text;
    // 如果匹配的不是{{ xxx }} 这种形式 则返回 _v('text')
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    } else {
      // 如果匹配的有 {{ xxx }} 这种形式 则 返回 _v(_s('name') + 'xxx')这种形式
      let tokens = [];
      let match;
      defaultTagRE.lastIndex = 0; // 每次匹配之前进行重置
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        let index = match.index; // 匹配的位置
        // 判断 匹配的位置和 上一次匹配的位置, 如果上一次匹配的位置比当前匹配的位置要小 就将中间的字符串截取出来
        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(lastIndex));
      }
      return `_v(${tokens.join("+")})`;
    }
  }
}

// 拼接字符串
function codegen(ast) {
  /**
   * _c('div',{id: 'app'}, _c('span', )) 这种格式
   */
  let children = genChildren(ast.children);
  let code = `_c('${ast.tag}',
    ${ast.attrs.length > 0 ? genProps(ast.attrs) : null}
    ${ast.children.length > 0 ? `,${children}` : "null"})`;
  return code;
}

export function compilerToFunction(template) {
  // 1、将template 转换成 ast语法树
  let ast = parseHTML(template);
  // 2、生成render 方法（render 执行后返回的结果就是 虚拟DOM）
  let code = codegen(ast);
  // 模板编译的原理 就是 with + new Function
  code = `with(this){return ${code}}`
  let render = new Function(code)

  return render
}
