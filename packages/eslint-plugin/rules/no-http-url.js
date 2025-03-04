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
      Literal: function handleRequires(node) {
        if (node.value && typeof node.value === 'string' && node.value.indexOf('http:') === 0) {
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
