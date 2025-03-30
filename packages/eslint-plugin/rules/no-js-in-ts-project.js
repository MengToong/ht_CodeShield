//!禁止在 TypeScript 项目中引入 .js 或 .jsx 文件，除非该文件是白名单中允许的

const path = require('path');

const RULE_NAME = 'no-js-in-ts-project';

const JS_REG = /\.jsx?$/;

const DEFAULT_WHITE_LIST = [
  'commitlint.config.js',
  'eslintrc.js',
  'prettierrc.js',
  'stylelintrc.js',
];

module.exports = {
  name: RULE_NAME,
  meta: {
    type: 'suggestion',
    fixable: null,
    messages: {
      noJSInTSProject: 'The "{{fileName}}" is not recommended in TS project',
    },
  },

  create(context) {
    const fileName = context.getFilename();
    const extName = path.extname(fileName);// 获取文件扩展名，比如 .js、.jsx
    const ruleOptions = context.options[0] || {};//获取规则的参数配置（如果有传递），没有就用空对象
    let { whiteList = [], autoMerge = true } = ruleOptions; // 解构获取 whiteList用户自定义的白名单 和 autoMerge 配置
    if (whiteList.length === 0) { //如果没有传自定义白名单，就使用默认白名单
      whiteList = DEFAULT_WHITE_LIST;
    } else if (autoMerge) {
      whiteList = [...new Set([...DEFAULT_WHITE_LIST, ...whiteList])];//如果 autoMerge 开启，就合并默认白名单和自定义白名单，并去重
    }
    const whiteListReg = new RegExp(`(${whiteList.join('|')})$`); //把白名单数组拼接成正则表达式，用于判断文件名是不是白名单文件

    if (!whiteListReg.test(fileName) && JS_REG.test(extName)) { //!如果当前文件 不是白名单 且扩展名是 .js 或 .jsx
      context.report({
        loc: {
          start: {
            line: 0,
            column: 0,
          },
          end: {
            line: 0,
            column: 0,
          },
        },
        messageId: 'noJSInTSProject',
        data: {
          fileName,
        },
      });
    }

    // Necessary
    return {};
  },
};
