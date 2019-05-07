# MAILER

## 使用说明

> 此项目是个半成品，所以配置会比较繁琐

1. 开启邮件的`IMAP`服务，QQ邮箱-账户-服务，需要短信验证，密码位置填写的是授权码
2. 配置`config.js`里面的信息
3. 安装`NodeJS`
4. 安装项目依赖, `npm install` 或者 `yarn install`
5. 全局安装本地项目, cd到本项目根目录, `npm install -g`或者`yarn global add .`
6. Use it anywhere & Have fun！

## HELP
```bash
# 根据配置的关键次，获取当天的邮件并导出附件
mailer

# 可选日期
mailer --date=2019-05-07
```