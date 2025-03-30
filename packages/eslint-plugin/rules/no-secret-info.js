//!不允许危险词的值是明文，例如只能使用环境变量作为ACCESS_TOKEN

const RULE_NAME = 'no-secret-info';

const DEFAULT_DANGEROUS_KEYS = ['secret', 'token', 'password']; //定义默认危险关键词列表，比如 secret、token、password，用于判断变量名或对象属性名是否可能存放敏感信息

module.exports = {
  meta: {
    type: 'problem',
    fixable: null, // 不支持自动修复
    messages: {
      noSecretInfo: 'Detect that the "{{secret}}" might be a secret token, Please check!', // 错误时报错
    },
  },

  create(context) {
    const ruleOptions = context.options[0] || {};
    let { dangerousKeys = [], autoMerge = true } = ruleOptions; //从规则参数中解构出 dangerousKeys（用户自定义的危险关键词列表） 和 autoMerge：（是否合并默认关键词）
    if (dangerousKeys.length === 0) {
      dangerousKeys = DEFAULT_DANGEROUS_KEYS; //如果用户没有传入 dangerousKeys，则使用默认的危险关键词列表
    } else if (autoMerge) {
      dangerousKeys = [...new Set(...DEFAULT_DANGEROUS_KEYS, ...dangerousKeys)]; //如果用户传入了 dangerousKeys，并且设置了 autoMerge 为 true，则将默认关键词列表和用户传入的关键词列表合并去重
    }
    const reg = new RegExp(dangerousKeys.join('|')); //把危险关键词拼成一个正则，用来检测变量名或属性名是否包含危险词。

    return {
      Literal: function handleRequires(node) { //监听 AST 中的 Literal 节点（字面量，比如字符串、数字等）
        if (
          node.value &&
          node.parent && //确保这个字面量有值，并且有父节点
          ((node.parent.type === 'VariableDeclarator' &&
            node.parent.id &&
            node.parent.id.name &&
            reg.test(node.parent.id.name.toLocaleLowerCase())) || //当前 Literal 节点（字面量，比如字符串 "123456"）的父节点是一个变量声明时 若 匹配到危险关键词列表
            (node.parent.type === 'Property' &&
              node.parent.key &&
              node.parent.key.name &&
              reg.test(node.parent.key.name.toLocaleLowerCase())))//当前 Literal 节点的父节点是一个对象属性时 若 匹配到危险关键词列表
        ) {
          context.report({
            node,
            messageId: 'noSecretInfo',
            data: {
              secret: node.value,
            },
          });
        }
      },
    };
  },
};
