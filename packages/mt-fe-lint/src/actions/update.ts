import { execSync } from 'child_process';
import ora from 'ora'; // 一个 loading 动画库，比如“正在检查版本...”
import log from '../utils/log';
import npmType from '../utils/npm-type'; //判断用 npm 还是 pnpm（异步判断）
import { PKG_NAME, PKG_VERSION } from '../utils/constants'; //#读取 package.json 里的此脚手架包名和版本号（本地的）
//!在init中被调用
/**
 * //!检查线上此脚手架npm包的版本,若有更新，若允许自动更新则更新，否则只给提示
 * @param install - 自动安装最新包 install 参数控制要不要自动安装新版本，默认是 true
 */
export default async (install = true) => {
  const checking = ora(`[${PKG_NAME}] 正在检查最新版本...`); //创建一个 loading 动画，提示“正在检查版本...”，并启动
  checking.start();

  try {
    const npm = await npmType;
    const latestVersion = await checkLatestVersion(); //#调用下面函数检查是否有更新版，有就返回版本号，否则返回null
    checking.stop();

    if (latestVersion && install) { //#如果线上有新版本，且 install 参数是 true配置的允许安装，就准备自动安装
      const update = ora(`[${PKG_NAME}] 存在新版本，将升级至 ${latestVersion}`);

      update.start();  //启动 loading 动画

      execSync(`${npm} i -g ${PKG_NAME}`); //执行全局安装命令，自动更新到最新版

      update.stop(); //停止 loading 动画
    } else if (latestVersion) { //#如果线上有新版本，但 install 参数是 false 配置的不允许自动安装，则只是提示有新版，让用户自己升级
      log.warn(
        `最新版本为 ${latestVersion}，本地版本为 ${PKG_VERSION}，请尽快升级到最新版本。\n你可以执行 ${npm} install -g ${PKG_NAME}@latest 来安装此版本\n`,
      );
    } else if (install) {
      log.info(`当前没有可用的更新`);
    }
  } catch (e) {
    checking.stop();
    log.error(e);
  }
};

/**
 * //!检查线上此脚手架npm包最新版本号，若比本地更新就返回最新版本号（字符串），如果没有更新就返回 null
 */
const checkLatestVersion = async (): Promise<string | null> => {
  const npm = await npmType; //等 npmType 判断好当前用的包管理器，是 npm 还是 pnpm
  const latestVersion = execSync(`${npm} view ${PKG_NAME} version`).toString('utf-8').trim(); //#获取"包名"在 npm 仓库里的最新版本号

  if (PKG_VERSION === latestVersion) return null; //如果本地版本号和最新版本号一致，就返回 null

  const compareArr = PKG_VERSION.split('.').map(Number); //把版本号按点 . 分隔成数组，比如 1.2.3 -> [1, 2, 3]，方便逐位比较
  const beComparedArr = latestVersion.split('.').map(Number);

  // 依次比较版本号每一位大小
  for (let i = 0; i < compareArr.length; i++) {
    if (compareArr[i] > beComparedArr[i]) { //如果某一位本地版本更大，直接返回 null（不会降级）
      return null;
    } else if (compareArr[i] < beComparedArr[i]) {  //如果发现线上更大，返回 latestVersion
      return latestVersion;
    }
  }
};