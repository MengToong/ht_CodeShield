//!检查 package.json 里的依赖版本号是否使用了不推荐的宽泛语义版本

const path = require('path');

const RULE_NAME = 'no-broad-semantic-versioning';

module.exports = {
  name: RULE_NAME,
  meta: {
    type: 'problem',// 检测出来报错
    fixable: null,
    messages: {
      noBroadSemanticVersioning:
        'The "{{dependencyName}}" is not recommended to use "{{versioning}}"', //报错信息
    },
  },

  create(context) {
    if (path.basename(context.getFilename()) !== 'package.json') { // 是package.json文件才检测
      return {};
    }

    const cwd = context.getCwd(); // 获取当前工作目录

    return { //! visitor
      Property: function handleRequires(node) { // 监听 AST 中的 Property 节点（对象属性）
        if (   
          node.key &&
          node.key.value &&
          (node.key.value === 'dependencies' || node.key.value === 'devDependencies') && // 是dependencies或devDependencies属性才检测
          node.value &&
          node.value.properties
        ) {
          node.value.properties.forEach((property) => { // 遍历这些依赖对象的子属性，也就是每个具体的依赖包名和版本号
            if (property.key && property.key.value) {
              const dependencyName = property.key.value; // 获取依赖的名字
              const dependencyVersion = property.value.value;  //获取依赖的版本号
              if (
                // *
                dependencyVersion.indexOf('*') > -1 || //如果包含 "*"、"x"、">" 任何一个，就认为是宽泛版本号，就报错
                // x.x
                dependencyVersion.indexOf('x') > -1 ||
                // > x
                dependencyVersion.indexOf('>') > -1
              ) {
                context.report({
                  loc: property.loc,
                  messageId: 'noBroadSemanticVersioning',
                  data: {
                    dependencyName,
                    versioning: dependencyVersion,
                  },
                });
              }
            }
          });
        }
      },
    };
  },
};
