//!检测项目中的冲突依赖（旧版 lint 工具或插件）。
//!检测项目中的无用配置文件（老版 .eslintrc、.stylelintrc 等）。
//!检测项目里是否存在需要被覆盖的配置文件（比如模板生成的文件）。
//!询问用户是否确认删除。
//!删除冲突配置，修正 package.json 依赖。
//!返回清理后的 package.json 对象。


import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import inquirer from 'inquirer';
import log from './log';
import { PKG_NAME } from './constants';
import type { PKG } from '../types';

// 精确移除依赖
const packageNamesToRemove = [  //!删除dependencies、devDependencies中这些依赖，因为脚手架包会带这些依赖，防止冲突
  '@babel/eslint-parser',
  '@commitlint/cli',
  '@iceworks/spec',
  'babel-eslint',
  'eslint',
  'husky',
  'markdownlint',
  'prettier',
  'stylelint',
  'tslint',
];

// 按前缀移除依赖
const packagePrefixesToRemove = [ //!按前缀删除dependencies、devDependencies中以 eslint-、stylelint- 开头的插件或工具,，因为脚手架包会带这些依赖，防止冲突
  '@commitlint/',
  '@typescript-eslint/',
  'eslint-',
  'stylelint-',
  'markdownlint-',
  'commitlint-',
];

/**
 * 待删除的无用配置 检查项目中是否存在老版本的配置文件，比如 .eslintrc.yml、.stylelintrc.json 等，返回这些文件名
 * @param cwd
 */
const checkUselessConfig = (cwd: string): string[] => { //!获取新项目中以杂七杂八后缀结尾的lint配置文件（如 .eslintrc.yaml / .prettierrc.toml), 等会儿会被删除（markdownlint.json与eslint.config.js这种正常的配置文件不删，但会被覆盖，见下）
  return []
    .concat(glob.sync('.eslintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(glob.sync('.stylelintrc?(.@(yaml|yml|json))', { cwd }))
    .concat(glob.sync('.markdownlint@(rc|.@(yaml|yml|jsonc))', { cwd }))
    .concat(
      glob.sync('.prettierrc?(.@(cjs|config.js|config.cjs|yaml|yml|json|json5|toml))', { cwd }),
    )
    .concat(glob.sync('tslint.@(yaml|yml|json)', { cwd }))
    .concat(glob.sync('.kylerc?(.@(yaml|yml|json))', { cwd }));
};

/**
 * 待重写的配置  检查项目中是否存在需要被覆盖的配置文件，比如模板目录（config）里的 .ejs 文件最终渲染生成的配置文件。
 * @param cwd
 */
const checkReWriteConfig = (cwd: string) => {//!获取新项目中与要写入的配置文件同名的文件（要被覆盖），等会儿提示一下将会被覆盖
  return glob
    .sync('**/*.ejs', { cwd: path.resolve(__dirname, '../config') })//获取 ../config 目录下所有 .ejs 模板文件的路径（相对路径）
    .map((name) => name.replace(/^_/, '.').replace(/\.ejs$/, ''))//将模板名转换成最终会生成的文件名。如_eslintrc.js.ejs → .eslintrc.js
    .filter((filename) => fs.existsSync(path.resolve(cwd, filename)));//筛选出新项目中与要写入的配置文件同名的文件，输出数组
};

export default async (cwd: string, rewriteConfig?: boolean) => {
  const pkgPath = path.resolve(cwd, 'package.json');
  const pkg: PKG = fs.readJSONSync(pkgPath);
  const dependencies = [].concat(
    Object.keys(pkg.dependencies || {}),
    Object.keys(pkg.devDependencies || []),
  );
  const willRemovePackage = dependencies.filter(
    (name) =>
      packageNamesToRemove.includes(name) ||
      packagePrefixesToRemove.some((prefix) => name.startsWith(prefix)),
  );
  const uselessConfig = checkUselessConfig(cwd);
  const reWriteConfig = checkReWriteConfig(cwd);
  const willChangeCount = willRemovePackage.length + uselessConfig.length + reWriteConfig.length;

  // 提示是否移除原配置
  if (willChangeCount > 0) {
    log.warn(`检测到项目中存在可能与 ${PKG_NAME} 冲突的依赖和配置，为保证正常运行将`);

    if (willRemovePackage.length > 0) {
      log.warn('删除以下依赖：');
      log.warn(JSON.stringify(willRemovePackage, null, 2));
    }

    if (uselessConfig.length > 0) {
      log.warn('删除以下配置文件：');
      log.warn(JSON.stringify(uselessConfig, null, 2));
    }

    if (reWriteConfig.length > 0) {
      log.warn('覆盖以下配置文件：');
      log.warn(JSON.stringify(reWriteConfig, null, 2));
    }

    if (typeof rewriteConfig === 'undefined') {
      const { isOverWrite } = await inquirer.prompt({
        type: 'confirm',
        name: 'isOverWrite',
        message: '请确认是否继续：',
      });

      if (!isOverWrite) process.exit(0);
    } else if (!reWriteConfig) {
      process.exit(0);
    }
  }

  // 删除杂七杂八后缀的lint配置文件
  for (const name of uselessConfig) {
    fs.removeSync(path.resolve(cwd, name)); //删除检测到的无用配置文件
  }

  // 修正 package.json 删除内联在 package.json 里的配置
  delete pkg.eslintConfig; //!删除新项目package.json 中旧的eslintConfig、eslintIgnore、stylelint设置(markdownlint和commitlint在package.json中无配置)
  delete pkg.eslintIgnore;
  delete pkg.stylelint;
  for (const name of willRemovePackage) { // 删除冲突依赖
    delete (pkg.dependencies || {})[name];
    delete (pkg.devDependencies || {})[name];
  }
  fs.writeFileSync(path.resolve(cwd, 'package.json'), JSON.stringify(pkg, null, 2), 'utf8'); // 保存修改后的 package.json

  return pkg; //返回处理后的 package.json 对象
};
