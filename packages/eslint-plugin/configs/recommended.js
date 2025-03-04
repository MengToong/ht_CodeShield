module.exports = {
  plugins: ['eslint-plugin-mt'], //我要用 eslint-plugin-mt 插件提供的规则，请加载进来
  rules: {
    'eslint-plugin-mt/no-http-url': 'warn',//只开起了4个规则中的这两个规则，并设置了警告级别
    'eslint-plugin-mt/no-secret-info': 'error',
  },
};
