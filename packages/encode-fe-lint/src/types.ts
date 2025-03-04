import { ESLint } from 'eslint';
import stylelint from 'stylelint';
import markdownlint from 'markdownlint';

export interface PKG { //#表示 package.json 的结构，方便后续读取 package.json 后用这个类型约束。
  eslintConfig?: any;
  eslintIgnore?: string[];
  stylelint?: any;
  peerDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  dependencies?: Record<string, string>;

  [key: string]: any;
}

export interface Config { //#定义 encode-fe-lint 的配置项（比如从 encode-fe-lint.config.js 读取的配置）
  // 是否启用 ESLint
  enableESLint?: boolean;
  // 是否启用 stylelint
  enableStylelint?: boolean;
  // 是否启用 markdown lint
  enableMarkdownlint?: boolean;
  // 是否启用 prettier
  enablePrettier?: boolean;
  // ESLint 配置项
  eslintOptions?: ESLint.Options;
  // stylelint 配置项
  stylelintOptions?: stylelint.LinterOptions;
  // markdownlint 配置项
  markdownlintOptions?: markdownlint.Options;
}

export interface ScanOptions { //#用于代码扫描时传入的参数
  // lint 运行的工程目录
  cwd: string;
  // 进行规范扫描的目录
  include: string;
  // 进行规范扫描的文件列表
  files?: string[];
  // 仅报告错误信息
  quiet?: boolean;
  // 忽略 eslint 的 ignore 配置文件和 ignore 规则
  ignore?: boolean;
  // 自动修复
  fix?: boolean;
  // 生成报告文件
  outputReport?: boolean;
  // scan 时指定 encode-fe-lint config，优先级高于 encode-fe-lint.config.js
  config?: Config;
}

export interface ScanResult { //#表示扫描完每个文件的结果
  filePath: string;
  errorCount: number;
  warningCount: number;
  fixableErrorCount: number;
  fixableWarningCount: number;
  messages: Array<{
    line: number;
    column: number;
    rule: string;
    url: string;
    message: string;
    errored: boolean;
  }>;
}

export interface ScanReport { //#表示最终扫描整个项目的检查报告
  results: ScanResult[];
  errorCount: number;
  warningCount: number;
  runErrors: Error[];
}

export interface InitOptions { //#初始化项目时用的参数
  cwd: string;
  // 是否检查并升级 encode-fe-lint 的版本
  checkVersionUpdate: boolean;
  // 是否需要自动重写 lint 配置
  rewriteConfig?: boolean;
  // eslint 类型
  eslintType?: string;
  // 是否启用 ESLint
  enableESLint?: boolean;
  // 是否启用 stylelint
  enableStylelint?: boolean;
  // 是否启用 markdownlint
  enableMarkdownlint?: boolean;
  // 是否启用 prettier
  enablePrettier?: boolean;
  // 是否禁用自动在初始化完成后安装依赖
  disableNpmInstall?: boolean;
}

export interface IGetLintConfig { //#定义一个根据传入参数生成 lint 配置的方法类型
  (options: ScanOptions, pkg: PKG, config: Config): ESLint.Options;

  (options: ScanOptions, pkg: PKG, config: Config): stylelint.LinterOptions;

  (options: ScanOptions, pkg: PKG, config: Config): markdownlint.Options;
}

export interface IFormatResults { //#定义一个格式化扫描结果的方法类型，可以处理不同 lint 的结果，最后统一转换成 ScanResult[] 格式
  (results: ESLint.LintResult[], quiet: boolean): ScanResult[];
  (results: stylelint.LintResult[], quiet: boolean): ScanResult[];
  (results: markdownlint.LintResults, quiet: boolean): ScanResult[];
}
