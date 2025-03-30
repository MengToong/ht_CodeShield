import { sync as commandExistsSync } from 'command-exists';

/**
 * npm 类型  //!通过 command-exists 检测命令行里是否装了 pnpm,返回一个 Promise，最终值是 'npm' 或 'pnpm'
 */
const promise: Promise<'npm' | 'pnpm'> = new Promise((resolve) => {
  if (!commandExistsSync('pnpm')) return resolve('npm');

  resolve('pnpm');
});

export default promise;
