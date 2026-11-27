# 仁爱通 Supabase Auth 邮件模板

本目录包含仁爱通品牌化的 Supabase Auth 邮件 HTML 模板：

| Supabase 模板 | HTML 文件 | 建议主题 |
|---|---|---|
| Confirm signup | confirmation.html | 请确认您的仁爱通注册邮箱 |
| Reset password | recovery.html | 重置您的仁爱通登录密码 |
| Magic link | magic_link.html | 您的仁爱通安全登录链接 |
| Invite user | invite.html | 您已收到仁爱通平台邀请 |
| Change email address | email_change.html | 请确认您的仁爱通新邮箱 |
| Reauthentication | reauthentication.html | 仁爱通账号身份验证 |
| Password changed notification | password_changed_notification.html | 仁爱通密码变更提醒 |
| Email changed notification | email_changed_notification.html | 仁爱通邮箱变更提醒 |

## 重要状态说明

这些文件已经准备为可粘贴到 Supabase Auth 的 HTML 内容，但**本次连接可操作数据库和 Edge Functions，没有提供 Supabase Management API 的 Auth 配置读写权限**，因此它们尚未自动写入托管项目的 Auth > Email Templates，不能宣称已经改变线上发信内容。

Supabase 官方支持通过 Management API 的 `PATCH /v1/projects/{ref}/config/auth` 修改邮件主题与 HTML。该接口需要 Supabase Personal Access Token（PAT），不是浏览器可公开的 publishable key，也不是普通用户 JWT。不要把 PAT 或 AI API 密钥放进网页源码或聊天消息。

项目参考：`mfmmwfdccspibvekoodb`
站点：`https://xymusicwzy.github.io/ratong/`

## 应用位置

Supabase Dashboard → Authentication → Email Templates。逐项粘贴对应 HTML，并设置表格中的主题。确认 Site URL 与 Redirect URLs 包含仁爱通站点地址。

模板使用 Supabase 支持的变量：`{{ .ConfirmationURL }}`、`{{ .Token }}`、`{{ .SiteURL }}`、`{{ .Email }}`、`{{ .NewEmail }}`、`{{ .OldEmail }}`。
