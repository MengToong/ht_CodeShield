//!建议http转为https

const RULE_NAME = 'no-http-url';

module.exports = {
  name: RULE_NAME,
  meta: { // 规则基本信息
    type: 'suggestion', // 类型（可选）
    fixable: null, // 是否支持自动修复
    messages: { // 规则提示信息
      noHttpUrl: 'Recommended "{{url}}" switch to HTTPS',
    },
  },
  create(context) {
    return {
      Literal: function handleRequires(node) { // 监听 AST 中的 Literal 节点（字面量，比如字符串、数字等）
        if (node.value && // 节点有值
          typeof node.value === 'string' &&  // 且是字符串
          node.value.indexOf('http:') === 0)  // 且是以 'http:' 开头
          {
          context.report({
            node,
            messageId: 'noHttpUrl',
            data: {
              url: node.value,
            },
          });
        }
      },
    };
  },
};
