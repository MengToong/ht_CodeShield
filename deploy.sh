#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

#获取 origin 远程仓库的推送地址
push_addr=`git remote get-url --push origin`

#获取当前的 Git 提交信息，作为 commit message 使用
commit_info=`git describe --all --always --long`
#VuePress 生成的静态文件目录
dist_path=docs/.vuepress/dist
#要推送到 GitHub Pages 的 gh-pages 分支
push_branch=gh-pages

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd $dist_path

git init
git add -A
git commit -m "deploy, $commit_info"
git push -f $push_addr HEAD:$push_branch

cd -
npx rimraf $dist_path
