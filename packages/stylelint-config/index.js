module.exports = {
  defaultSeverity: 'warning',//默认将所有违规规则标记为警告（warning），而不是错误（error）。
  plugins: ['stylelint-scss'],//使用 stylelint-scss 插件，扩展了对 SCSS 语法的支持。
  rules: {
    /**
     * Possible errors
     * @link https://stylelint.io/user-guide/rules/#possible-errors
     */
    'at-rule-no-unknown': null,//关闭对未知 at 规则的检查（交给 scss/at-rule-no-unknown）。
    'scss/at-rule-no-unknown': true,//禁止使用未知的 SCSS at 规则。
    'block-no-empty': null,//禁止空的块（block）。
    'color-no-invalid-hex': true,//禁止无效的十六进制颜色值。
    'comment-no-empty': true,//禁止空的注释。
    'declaration-block-no-duplicate-properties': [ //禁止重复属性，但连续且值不同的可以。
      true, 
      {
        ignore: ['consecutive-duplicates-with-different-values'],
      },
    ],
    'declaration-block-no-shorthand-property-overrides': true, //禁止简写属性覆盖普通属性。
    'font-family-no-duplicate-names': true, //禁止重复的字体名称。
    'function-calc-no-unspaced-operator': true, //禁止 calc() 运算符前后缺少空格。
    'function-linear-gradient-no-nonstandard-direction': true, //禁止使用非标准的渐变方向。
    'keyframe-declaration-no-important': true, //禁止在 keyframe 中使用 !important。
    'media-feature-name-no-unknown': true, //禁止使用未知的媒体特性名称。
    'no-descending-specificity': null, //允许选择器优先级递减（有争议场景较多）
    'no-duplicate-at-import-rules': true, //禁止重复的 @import 规则
    'no-duplicate-selectors': true, //禁止重复的选择器
    'no-empty-source': null, //允许空的样式文件。
    'no-extra-semicolons': true, //禁止多余的分号。
    'no-invalid-double-slash-comments': true, //禁止在 CSS 中用 // 注释（除非用的是 SCSS）。
    'property-no-unknown': true, //禁止使用未知的 CSS 属性。
    'selector-pseudo-class-no-unknown': [ //禁止未知伪类，但允许 global, local, export。
      true, 
      {
        ignorePseudoClasses: ['global', 'local', 'export'],
      },
    ],
    'selector-pseudo-element-no-unknown': true, //禁止未知伪元素。
    'string-no-newline': true, //禁止字符串中换行。
    'unit-no-unknown': [ //禁止未知单位，但允许 rpx（适配小程序等场景）
      true,
      {
        ignoreUnits: ['rpx'],
      },
    ],

    /**
     * Stylistic issues
     * @link https://stylelint.io/user-guide/rules/list#stylistic-issues
     */
    indentation: 2, //缩进为 2 个空格。
    'block-closing-brace-newline-before': 'always-multi-line', //多行块前的 } 要换行。
    'block-closing-brace-space-before': 'always-single-line', //单行块前的 } 要有空格。
    'block-opening-brace-newline-after': 'always-multi-line', //多行块后的 { 换行。
    'block-opening-brace-space-before': 'always', //{ 前总是有空格。
    'block-opening-brace-space-after': 'always-single-line', //单行块的 { 后有空格。
    'color-hex-case': 'lower', //十六进制颜色小写。
    'color-hex-length': 'short', //	使用短格式的颜色（如 #fff）。
    'comment-whitespace-inside': 'always', //注释内要有空格。
    'declaration-colon-space-before': 'never', //属性冒号前不留空格。
    'declaration-colon-space-after': 'always', //属性冒号后有空格。
    'declaration-block-single-line-max-declarations': 1, //单行只能写一个声明。
    'declaration-block-trailing-semicolon': [ //最后一条声明也要有分号，违规直接报 error。
      'always',
      {
        severity: 'error',
      },
    ],
    'length-zero-no-unit': [ //零值不带单位（0px → 0），但允许自定义属性例外。
      true,
      {
        ignore: ['custom-properties'],
      },
    ],
    'max-line-length': 100, //每行最多 100 个字符。
    'selector-max-id': 0, //禁止使用 ID 选择器（#id）
    'value-list-comma-space-after': 'always-single-line', //单行值列表逗号后要有空格

    /**
     * stylelint-scss rules
     * @link https://www.npmjs.com/package/stylelint-scss
     */
    'scss/double-slash-comment-whitespace-inside': 'always', // 注释后面要有空格
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
};
