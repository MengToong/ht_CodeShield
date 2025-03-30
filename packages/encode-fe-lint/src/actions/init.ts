import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer'; //#Node.js 里的交互工具，能在终端里弹出问题给用户选择
import spawn from 'cross-spawn';
import update from './update';
import npmType from '../utils/npm-type';
import log from '../utils/log';
import conflictResolve from '../utils/conflict-resolve';
import generateTemplate from '../utils/generate-template';
import { PROJECT_TYPES, PKG_NAME } from '../utils/constants'; //PROJECT_TYPES为项目类型选择列表，用于用户选择
import type { InitOptions, PKG } from '../types';

let step = 0;

/**
 * 选择项目语言和框架
 */
const chooseEslintType = async (): Promise<string> => { //! 用命令行交互的方式，询问用户当前项目是用什么语言和框架的（JS/TS/React/Vue），返回用户的选择结果。(被下文调用)
  const { type } = await inquirer.prompt({ //这句代码会暂停等待用户输入，直到选完之后才继续执行。
    type: 'list', //问题的类型是 list，就是让用户在一个列表菜单里选择，而不是输入文本
    name: 'type', //用户选择的答案存储在inquirer.prompt返回的对象的type属性中，前面进行解构type就是选择答案
    message: `Step ${++step}. 请选择项目的语言（JS/TS）和框架（React/Vue）类型：`, //展示给用户的提问内容
    choices: PROJECT_TYPES, //给用户的选项列表（位于utils/constants.ts）
  });

  return type;//用户选择的答案，即PROJECT_TYPES中的type
};

/**
 * 选择是否启用 stylelint
 * @param defaultValue
 */
const chooseEnableStylelint = async (defaultValue: boolean): Promise<boolean> => { //#命令行选择是否用Stylelint，返回布尔值(被下文调用)
  const { enable } = await inquirer.prompt({
    type: 'confirm', //问题类型是 confirm，也就是**“是/否”确认框**，用户只需要选择 Yes / No（或者按 Enter 接受默认值）
    name: 'enable',//inquirer.prompt最终返回的对象会是 { enable: true } 或 { enable: false }
    message: `Step ${++step}. 是否需要使用 stylelint（若没有样式文件则不需要）：`,
    default: defaultValue,//设置默认选项，如果用户直接按 Enter，不选 Yes 或 No，就用这个值
  });

  return enable;
};

/**
 * 选择是否启用 markdownlint
 */
const chooseEnableMarkdownLint = async (): Promise<boolean> => { //#命令行选择是否用MarkdownLint，返回布尔值(被下文调用)
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 markdownlint（若没有 Markdown 文件则不需要）：`,
    default: true,
  });

  return enable;
};

/**
 * 选择是否启用 prettier
 */
const chooseEnablePrettier = async (): Promise<boolean> => {//#命令行选择是否用Prettier，返回布尔值(被下文调用)
  const { enable } = await inquirer.prompt({
    type: 'confirm',
    name: 'enable',
    message: `Step ${++step}. 是否需要使用 Prettier 格式化代码：`,
    default: true,
  });

  return enable;
};

export default async (options: InitOptions) => {
  const cwd = options.cwd || process.cwd(); //获取项目根目录
  const isTest = process.env.NODE_ENV === 'test'; //判断是不是在测试环境
  const checkVersionUpdate = options.checkVersionUpdate || false; //是否检查自身版本更新
  const disableNpmInstall = options.disableNpmInstall || false; //是否禁用依赖安装
  const config: Record<string, any> = {}; //用来存储初始化过程中的配置
  const pkgPath = path.resolve(cwd, 'package.json'); //读取项目的 package.json，准备后续修改
  let pkg: PKG = fs.readJSONSync(pkgPath);//读取 package.json

  // 版本检查
  if (!isTest && checkVersionUpdate) { //!步骤1：非测试环境 & 需要检查版本时，调用 update() 检查脚手架npm包是否有新版本,并根据用户配置选择自动更新
    await update(false);
  }

  // 初始化 `enableESLint`，默认为 true，无需让用户选择
  if (typeof options.enableESLint === 'boolean') { //#默认开启eslint无需用户选择，除非配置里明确不开启
    config.enableESLint = options.enableESLint;
  } else {
    config.enableESLint = true;
  }

  // 初始化 `eslintType`
  //条件1：用户在调用 init 的时候，手动传了 eslintType
  //条件 2：传的值要在 PROJECT_TYPES 里找得到对应的 value
  if (options.eslintType && PROJECT_TYPES.find((choice) => choice.value === options.eslintType)) {
    config.eslintType = options.eslintType;
  } else {
    config.eslintType = await chooseEslintType();//!步骤2：进行脚手架配置：若用户调用 init 时候未传eslintType，或者传的值不在 PROJECT_TYPES 里，才调用 chooseEslintType() 让用户选择
  }

  // 初始化 `enableStylelint`
  if (typeof options.enableStylelint === 'boolean') {//#步骤2：init时配置项里有enableStylelint则直接决定是否开启stylelint，否则才询问用户是否开启
    config.enableStylelint = options.enableStylelint;
  } else {
    config.enableStylelint = await chooseEnableStylelint(!/node/.test(config.eslintType));//在scan里如果config.enableStylelint=true则进行stylelint检查
  }

  // 初始化 `enableMarkdownlint`
  if (typeof options.enableMarkdownlint === 'boolean') {//#步骤2：init时配置项里有enableMarkdownlint则直接决定是否开启Markdownlint，否则才询问用户是否开启
    config.enableMarkdownlint = options.enableMarkdownlint;
  } else {
    config.enableMarkdownlint = await chooseEnableMarkdownLint();//在scan里如果config.enableMarkdownlint=true则进行Markdownlint检查
  }

  // 初始化 `enablePrettier`
  if (typeof options.enablePrettier === 'boolean') {//#步骤2：init时配置项里有enablePrettier则直接决定是否开启Prettier，否则才询问用户是否开启
    config.enablePrettier = options.enablePrettier;
  } else {
    config.enablePrettier = await chooseEnablePrettier();//在scan里如果启用了 fix 且 Prettier 没被禁用，就用 doPrettier() 格式化代码
  }

  if (!isTest) { //如果不是测试环境（方便测试时跳过这些需要实际操作文件和安装依赖的步骤）
    log.info(`Step ${++step}. 检查并处理项目中可能存在的依赖和配置冲突`);
    pkg = await conflictResolve(cwd, options.rewriteConfig); //!步骤3：检查你的项目里有没有与脚手架冲突的配置文件或依赖项，并修改你项目的package.json
    log.success(`Step ${step}. 已完成项目依赖和配置冲突检查处理 :D`);

    if (!disableNpmInstall) {
      log.info(`Step ${++step}. 安装依赖`);
      const npm = await npmType;
      spawn.sync(npm, ['i', '-D', PKG_NAME], { stdio: 'inherit', cwd });//!安装 encode-fe-lint 包作为项目 devDependency，自动写入项目package.json（会顺带导入encode-fe-lint 包依赖的那几个自定义规则配置包）
      log.success(`Step ${step}. 安装依赖成功 :D`);
    }
  }

  // 更新 pkg.json
  pkg = fs.readJSONSync(pkgPath); // 重新读取一次 package.json（因为 conflictResolve 或安装可能改了）
  // 在 `package.json` 中写入 `scripts`
  if (!pkg.scripts) {
    pkg.scripts = {};
  }
  if (!pkg.scripts[`${PKG_NAME}-scan`]) {
    pkg.scripts[`${PKG_NAME}-scan`] = `${PKG_NAME} scan`;//!步骤4：自动在 package.json的scripts 里加入"encode-fe-lint-scan": "encode-fe-lint scan",和"encode-fe-lint-fix": "encode-fe-lint fix"
  }
  if (!pkg.scripts[`${PKG_NAME}-fix`]) {
    pkg.scripts[`${PKG_NAME}-fix`] = `${PKG_NAME} fix`;
  }

  // 配置 commit 卡点
  log.info(`Step ${++step}. 配置 git commit 卡点`);
  if (!pkg.husky) pkg.husky = {}; //检查 package.json 里有没有 husky 配置，没有的话就创建空对象
  if (!pkg.husky.hooks) pkg.husky.hooks = {};
  pkg.husky.hooks['pre-commit'] = `${PKG_NAME} commit-file-scan`;//!步骤5：配置husky：在执行 git commit 之前的pre-commit钩子执行encode-fe-lint commit-file-scan命令，检查代码文件是否符合规范，比如是否通过了 eslint 等
  pkg.husky.hooks['commit-msg'] = `${PKG_NAME} commit-msg-scan`;//!步骤5：配置husky：提交信息写完时	的commit-msg钩子执行encode-fe-lint commit-msg-scan命令，检查提交信息是否符合规范，比如是否符合 commitlint 规范
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));// 把修改后的 package.json 保存回文件，写入磁盘
  log.success(`Step ${step}. 配置 git commit 卡点成功 :D`);

  log.info(`Step ${++step}. 写入配置文件`);
  generateTemplate(cwd, config); //!步骤6：根据初始化时用户的选择，把对应的.ejs模板文件复制并渲染成最终的js配置文件,写入项目根目录
  log.success(`Step ${step}. 写入配置文件成功 :D`);

  // 完成信息
  const logs = [`${PKG_NAME} 初始化完成 :D`].join('\r\n');
  log.success(logs);
};
