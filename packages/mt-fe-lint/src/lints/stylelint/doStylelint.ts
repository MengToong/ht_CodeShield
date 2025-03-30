import fg from 'fast-glob';
import { extname, join } from 'path';
import stylelint from 'stylelint';
import { PKG, ScanOptions } from '../../types';
import { STYLELINT_FILE_EXT, STYLELINT_IGNORE_PATTERN } from '../../utils/constants';
import { formatStylelintResults } from './formatStylelintResults';
import { getStylelintConfig } from './getStylelintConfig';

export interface DoStylelintOptions extends ScanOptions {
  pkg: PKG;
}

export async function doStylelint(options: DoStylelintOptions) { //!与eslint或prettier过程都类似，参考他们就行
  let files: string[];
  if (options.files) {
    files = options.files.filter((name) => STYLELINT_FILE_EXT.includes(extname(name)));
  } else {
    const pattern = join(
      options.include,
      `**/*.{${STYLELINT_FILE_EXT.map((t) => t.replace(/^\./, '')).join(',')}}`,
    );
    files = await fg(pattern, { //待检查文件
      cwd: options.cwd,
      ignore: STYLELINT_IGNORE_PATTERN,
    });
  }
  const data = await stylelint.lint({//!stylelint检查，若配置里fix=true则自动修复
    ...getStylelintConfig(options, options.pkg, options.config),//确定配置文件，配置内容展开作为参数给lint
    files,//待检查文件
  });
  return formatStylelintResults(data.results, options.quiet);
}
