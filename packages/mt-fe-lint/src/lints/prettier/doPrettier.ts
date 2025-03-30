import fg from 'fast-glob';
import { readFile, writeFile } from 'fs-extra';
import { extname, join } from 'path';
import prettier from 'prettier';
import { ScanOptions } from '../../types';
import { PRETTIER_FILE_EXT, PRETTIER_IGNORE_PATTERN } from '../../utils/constants';

export interface DoPrettierOptions extends ScanOptions {}

export async function doPrettier(options: DoPrettierOptions) {
  let files: string[] = [];
  if (options.files) { //如果用户指定了文件列表
    files = options.files.filter((name) => PRETTIER_FILE_EXT.includes(extname(name)));//过滤出用户指定的文件列表中所有eslint/stylelint/markdownlint所要处理的文件（按照后缀）
  } else { //如果用户没有指定文件列表
    const pattern = join(
      options.include,
      `**/*.{${PRETTIER_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`, //将PRETTIER_FILE_EXT包括的后缀预处理，以便后面的fast-glob搜索
    );
    files = await fg(pattern, {//全局搜索项目内的符合文件后缀的文件
      cwd: options.cwd,
      ignore: PRETTIER_IGNORE_PATTERN,
    });
  }
  await Promise.all(files.map(formatFile)); //#依次格式化每个上面筛选/搜索出来的文件
}

async function formatFile(filepath: string) {
  const text = await readFile(filepath, 'utf8'); // 读取文件内容
  const options = await prettier.resolveConfig(filepath); //自动读取当前文件路径下的 .prettierrc 或 prettier.config.js 等 Prettier 配置。
  const formatted = prettier.format(text, { ...options, filepath }); //#使用 Prettier 按规则格式化文本
  await writeFile(filepath, formatted, 'utf8');//把格式化后的内容写回原文件
}
