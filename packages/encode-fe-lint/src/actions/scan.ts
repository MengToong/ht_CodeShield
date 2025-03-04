import fs from 'fs-extra';
import path from 'path';
import { doESLint, doMarkdownlint, doPrettier, doStylelint } from '../lints';
import type { Config, PKG, ScanOptions, ScanReport, ScanResult } from '../types';
import { PKG_NAME } from '../utils/constants';

export default async (options: ScanOptions): Promise<ScanReport> => { //传入 ScanOptions，返回的是一个 ScanReport（扫描报告）
  const { cwd, fix, outputReport, config: scanConfig } = options;//解构用户传入的参数: cwd 项目根目录，fix 是否修复，outputReport 是否输出报告，config 扫描配置

  const readConfigFile = (pth: string): any => { //定义一个内部方法 readConfigFile() 用来读取指定路径的 JSON 配置文件，如果不存在就返回 {} 空对象。
    const localPath = path.resolve(cwd, pth);
    return fs.existsSync(localPath) ? require(localPath) : {};
  };
  const pkg: PKG = readConfigFile('package.json'); //读取项目里的 package.json 和 encode-fe-lint.config.js（如果有）。 如果用户传入了 scanConfig 配置，就优先用传入的。
  const config: Config = scanConfig || readConfigFile(`${PKG_NAME}.config.js`);
  const runErrors: Error[] = []; //存储扫描过程中发生的错误
  let results: ScanResult[] = []; //存储扫描得到的所有结果

  // prettier
  if (fix && config.enablePrettier !== false) { //!如果启用了 fix 且 Prettier 没被禁用，就用 doPrettier() 格式化代码
    await doPrettier(options);
  }

  // eslint
  if (config.enableESLint !== false) { //如果 ESLint 没被禁用
    try {
      const eslintResults = await doESLint({ ...options, pkg, config });//!调用doESLint() 进行eslint检查。 doESLint()内确定待检查文件和配置文件（有.eslintrc则使用）
      results = results.concat(eslintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // stylelint
  if (config.enableStylelint !== false) { //如果没禁用 Stylelint
    try {
      const stylelintResults = await doStylelint({ ...options, pkg, config });//!调用doStylelint() 进行stylelint检查。 doStylelint()内确定待检查文件和配置文件（有.stylelintrc则使用）
      results = results.concat(stylelintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // markdown
  if (config.enableMarkdownlint !== false) { //如果没禁用 Markdownlint
    try {
      const markdownlintResults = await doMarkdownlint({ ...options, pkg, config });//!调用doMarkdownlint() 进行markdownlint检查。 doMarkdownlint()内确定待检查文件和配置文件（有.markdownlint.json则使用）
      results = results.concat(markdownlintResults);
    } catch (e) {
      runErrors.push(e);
    }
  }

  // 生成报告报告文件
  if (outputReport) {
    const reportPath = path.resolve(process.cwd(), `./${PKG_NAME}-report.json`);//如果用户需要输出报告文件，就把扫描结果写成 JSON 存到项目根目录,文件名《cli包名-report.json》
    fs.outputFile(reportPath, JSON.stringify(results, null, 2), () => {});
  }

  return {
    results,//完整的扫描结果
    errorCount: results.reduce((count, { errorCount }) => count + errorCount, 0),//错误数量总和
    warningCount: results.reduce((count, { warningCount }) => count + warningCount, 0),//警告数量总和
    runErrors,//执行中发生的异常
  };
};
