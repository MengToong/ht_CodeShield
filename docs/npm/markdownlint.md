---
title: markdownlint-config-mt
categories:
  - 工程规范
tags:
  - 工程规范
author:
  name: mengtong
  link: https://github.com/MengToong/ht_CodeShield
---

# markdownlint-config-mt

:::tip
MengTong 文档 规范
:::

支持配套的 [markdownlint 可共享配置](https://www.npmjs.com/package/markdownlint#optionsconfig)。

## 安装

需要先行安装 [markdownlint](https://www.npmjs.com/package/markdownlint)：

```bash
npm install markdownlint-config-mt markdownlint --save-dev
```

## 使用

在 `.markdownlint.json` 中继承本包:

```json
{
  "extends": "markdownlint-config-mt"
}
```
