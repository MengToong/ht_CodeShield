module.exports = {
  extends: [
    './rules/base/best-practices',
    './rules/base/possible-errors',
    './rules/base/style',
    './rules/base/variables',
    './rules/base/es6',
    './rules/base/strict',
    './rules/imports',
  ].map(require.resolve),
  parser: '@babel/eslint-parser', // 使用 @babel/eslint-parser 作为代码解析器，让 ESLint 能正确理解 Babel 支持的语法,如ES6+、JSX、装饰器等
  parserOptions: {
    requireConfigFile: false, // 让 @babel/eslint-parser 直接工作，不需要 .babelrc 或 babel.config.js
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: true,
      jsx: true,
    },
  },
  root: true,
};
