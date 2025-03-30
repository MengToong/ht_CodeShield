import { ESLint } from 'eslint';
import fg from 'fast-glob';
import { extname, join } from 'path';
import { Config, PKG, ScanOptions } from '../../types';
import { ESLINT_FILE_EXT, ESLINT_IGNORE_PATTERN } from '../../utils/constants';
import { formatESLintResults } from './formatESLintResults';
import { getESLintConfig } from './getESLintConfig';

export interface DoESLintOptions extends ScanOptions {
  pkg: PKG;
  config?: Config;
}

export async function doESLint(options: DoESLintOptions) {
  let files: string[];
  if (options.files) { //若用户在配置里指定了文件列表
    files = options.files.filter((name) => ESLINT_FILE_EXT.includes(extname(name)));//用 .filter() 方法筛选出符合 ESLint 支持的文件类型的文件列表
  } else { //如果用户没有指定文件列表
    files = await fg(`**/*.{${ESLINT_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`, { //用 fast-glob 自动全项目扫描符合ESLINT_FILE_EXT设定后缀的文件
      cwd: options.cwd,
      ignore: ESLINT_IGNORE_PATTERN,
    });
  }

  const eslint = new ESLint(getESLintConfig(options, options.pkg, options.config));//#getESLintConfig确定eslint配置文件
  const reports = await eslint.lintFiles(files); //!对传入的文件数组进行 eslint 检查
  if (options.fix) {
    await ESLint.outputFixes(reports);//!修复
  }

  return formatESLintResults(reports, options.quiet, eslint);
}
