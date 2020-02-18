# Travis CI
一个提供持续集成服务，用于测试和部署的自动化的工具。

## 主要流程
- 将 github 中的仓库信息同步到 Travis CI，当满足任务触发条件时，Travis 将在虚拟容器中执行仓库根目录下的 `.travis.yml` 中配置的任务。
- 需要允许 Travis 对目标服务器的访问。因此，对于远程服务器需要配置[免密登录](./SSH_Login.md)，而对于 github 的访问，需要指定一个 `github_token`。

### 准备工作
1. 使用 github 账号登录 [Travis CI](https://www.travis-ci.org/)；
2. 选择需要同步到 Travis 的 github 仓库；
3. 在 settings（More options） 面板中进行指定项目的配置：
    - General：选择触发任务的时机，比如勾选 Build pushed branches 表示推送时触发构建
    - Environment Variables：设置执行任务时容器的环境变量

### 配置文件
在根目录下创建 `.travis.yml`，通过该配置文件告知 travis 需要执行的具体任务。

## Github Pages 示例

一个 github pages [快捷部署](https://docs.travis-ci.com/user/deployment/)的参考配置：

```yml
language: node_js
node_js:
  - lts/*
install:
  - npm install 
script:
  - npm run docs:build
deploy:
  provider: pages # 部署到 github pages， 会自动创建 gh-pages 分支
  skip_cleanup: true
  local_dir: docs/.vuepress/dist # 需要推送的本地目录
  target-branch: master # 推送的目标仓库分支
  repo: shownoso/shownoso.github.io # 推送的目标仓库
  github_token: $GITHUB_TOKEN # 用于允许 Travis 向你的仓库推送代码。在 GitHub 中生成，在 Travis 的项目设置页面进行配置
  keep_history: true
  on:
    branch: master # 本地项目的master分支
```
### github_token
为了完成 `deploy` 任务，Travis 需要获得一些必要权限，用于对 github 上仓库代码的拉取、推送等操作，因此，在 github 配置一个 `Personal access token`。
  - 进入 github 主页点击个人头像，进入 Settings-Developer -> settings -> Personal access tokens 面板，点击 Generate new token 选择需要的权限并生成新的 token。
  - 复制这个 token，回到 Travis 项目配置页，在 Environment Variables 中添加一个环境变量 `GITHUB_TOKEN`，值为该 token。


## Travis 客户端工具
1. 安装：
```bash
# 本地环境为 Cent OS 7

# 安装 ruby 并更改 gem 源
yum install ruby
gem sources --remove https://rubygems.org/
gem sources -a https://gems.ruby-china.com

# for centos7(Redhat) distro 
yum install ruby-devel 

# 更新 gem（按需）
# gem update --system

# 安装 travis
gem install travis

```
2. 登录
```bash
travis login
```
### Travis 加密
1. 加密一段文本  
在 Environment Variables 中配置了环境变量 `GITHUB_TOKEN`，它的值在 Travis 网站是明文保存的。当不希望这样时，可以使用 `travis encrypt` 对其进行加密使用。

```bash 
# 在本地项目的根目录下执行
travis encrypt GITHUB_TOKEN="token" --add
```
- GITHUB_TOKEN：环境变量名
- token：github 中生成的的 `Personal access token`
- --add：将输出自动添加到 `.travis.yml`

在 `.travis.yml` 使用加密文本，添加了一个环境变量

```yml
env:
  global:
    secure: TR0...zw=
```

2. 加密一个文件  
当希望 Travis 免密登录远程服务器时，可以使用 `travis encrypt-file` 对服务器的私钥进行加密
```bash
# 在本地项目根目录下，对私钥进行加密
travis encrypt-file ~/.ssh/id_rsa --add
```
- 将在项目根目录创建 id_rsa.enc
- travis 会给出提示 将私钥加密后的 id_rsa.enc 提交到仓库而不是将私钥 id_rsa 本身提交到仓库
- --add： 将输出自动添加到 `.travis.yml` 中的 `before_install`

在 `.travis.yml` 使用密钥

```yml
# --add生成的路径 （~\/.ssh/id_rsa）添加了转义符
# 手动去除转义符 \
before_install:
- openssl aes-256-cbc -K $encrypted_xxxxxxxxxxxx_key -iv $encrypted_xxxxxxxxxxxx_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
# 修改私钥权限以支持访问
- chmod 600 ~/.ssh/id_rsa
```
- $encrypted_xxxxxxxxxxxx_key 和 $encrypted_xxxxxxxxxxxx_iv 在 Settings 面板中的 Environment Variables 配置中
- Travis 在执行解密操作时，需要用到这两个环境变量 


## 远程服务器示例
```yml
language: node_js
node_js:
- lts/*
install:
- npm install
script:
- npm run docs:build
after_success:
- ssh $REMOTE_USER "echo 'travis build done!' "
before_install:
- openssl aes-256-cbc -K $encrypted_xxxxxxxxxxxx_key -iv $encrypted_xxxxxxxxxxxx_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
- chmod 600 ~/.ssh/id_rsa
addons:
  ssh_known_hosts: $REMOTE_IP
env:
  global:
  - secure: WOt...9M=
  - secure: M3X...xc=
  - secure: Pk8.../I=

```


### 使用 Travis 访问远程服务器的注意点
1. Travis 进行免密登录时，需要增加一行 `- chmod 600 ~/.ssh/id_rsa` 修改容器中私钥的访问权限。
2. 第一次登录远程服务器会出现 SSH 主机验证，需要添加受信主机。
```yml
addons:
  ssh_known_hosts: your-ip
```
或者通过 `-o StrictHostKeyChecking=no` 取消严格验证
```yml
after_success:
- ssh user@server -o StrictHostKeyChecking=no "./deploy.sh"
```


## 附录：Travis 任务的生命周期
1. before_install 安装依赖前
2. install 安装依赖时
3. before_script 执行脚本前
4. script 执行脚本时
5. after_success 或 after_failure 执行脚本成功（失败）后
6. before_deploy 部署前
7. deploy 部署时
8. after_deploy 部署后
9. after_script 执行脚本后

