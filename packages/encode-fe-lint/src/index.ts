//!脚手架核心功能暴露

import ora from 'ora';
import scanAction from './actions/scan';
import initAction from './actions/init';
import { PKG_NAME } from './utils/constants';
import printReport from './utils/print-report';
import type { InitOptions, ScanOptions } from './types';

type IInitOptions = Omit<InitOptions, 'checkVersionUpdate'>;  // 定义了一个新的类型 IInitOptions，它等于 InitOptions 但去掉了 checkVersionUpdate 这个属性。
                                                              //说明 init() 对外暴露的时候不需要用户传 checkVersionUpdate，它内部默认关掉了

export const init = async (options: IInitOptions) => {
  return await initAction({ //#调用 initAction() 执行初始化操作。
    ...options,
    checkVersionUpdate: false, //表示初始化时不检查版本更新
  });
};

export const scan = async (options: ScanOptions) => {
  const checking = ora();
  checking.start(`执行 ${PKG_NAME} 代码检查`); //创建 loading 动画，提示“执行 encode-fe-lint 代码检查”

  const report = await scanAction(options); //#调用 scanAction() 执行代码检查，得到检查结果
  const { results, errorCount, warningCount } = report;
  let type = 'succeed'; //根据检查结果的错误数和警告数，设置 type 为 'succeed'、'fail' 或 'warn'
  if (errorCount > 0) {
    type = 'fail';
  } else if (warningCount > 0) {
    type = 'warn';
  }

  checking[type](); //根据 type 的值，调用 loading 动画的 succeed()、fail() 或 warn() 方法，显示检查结果
  if (results.length > 0) printReport(results, false); //如果有检查结果，调用 printReport() 打印检查结果

  return report;
};
