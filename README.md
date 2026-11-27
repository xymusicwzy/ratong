# 仁爱通（Renaitong）

仁爱通英语学习与测评平台前端。

## 发布方式
本仓库通过 GitHub Actions 发布到 GitHub Pages。主分支 `main` 有提交时自动构建并发布；也可以在 Actions 中手动运行 **Publish Renaitong to GitHub Pages**。

预期访问地址：<https://xymusicwzy.github.io/ratong/>

## 当前前端模块
- 学习总览
- 单词打卡
- 口语听说与录音
- 在线练题
- 学习档案
- 教师工作台
- 管理员后台
- 模板下载中心

## 重要说明
前端沿用现有仁爱通实现。账号、词库、练习、录音、教师与管理员功能依赖原 Supabase 项目中的数据库结构及 Edge Functions。仅发布静态网页不等于后端迁移；上线后应检查 Auth、数据库表、RLS 与 Edge Functions 是否仍可访问。不要把 service_role 密钥写入前端。
