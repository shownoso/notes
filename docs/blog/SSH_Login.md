# SSH 免密登陆 
通过 SSH 进行远程登录有两种方式。
- 第一种基于口令：每次登录都需要输入密码，即使 SSH 为传输的数据提供了可靠的加密，但是依然不能保证目标服务器就是真正想要连接的服务器。
- 第二种基于密钥对：创建一对密钥，将公钥放在服务器，私钥放在本地，公钥私钥匹配则认证成功。

第二种方式即“免密登录”

## 加密算法
1. 对称加密： 加密和解密互为逆运算
2. 不对称加密：加密和解密的运算方法不同。常用的不对称加密有 RSA、Elgamal、ECC 等。

### RSA
[算法原理](https://blog.csdn.net/wjiabin/article/details/85228078)

## 配置与使用

1. 生成密钥对
```bash
cd  ~/.ssh
# -t：密钥类型 -C：识别该密钥的注释 -f：生成的文件名
ssh-keygen -t rsa -C "shownoso" -f "shownoso_rsa"
# 出现钥匙对密码提示 直接回车跳过
# 当前目录会有生成 公钥 shownoso_rsa.pub 和私钥 shownoso_rsa
```
2. 上传公钥

上传至服务器对应账号的/home（root用户则默认在/root）的/.ssh目录。
```bash
# 上传公钥到目标服务器，（自动）写入 ~/ssh/authorized_keys
ssh-copy-id -i shownoso_rsa.pub root@服务器ip/域名

# 追加公钥的方式
# cat shownoso_rsa.pub >> authorized_keys

# 配置访问权限
chmod 600 shownoso_rsa.pub
# or
chmod 600 authorized_keys
```

3. 使用
```bash
# -i：指定私钥进行远程登录
ssh -i ~/.ssh/shownoso_rsa root@服务器ip/域名
```

4. 使用配置
```bash
cd ~/.ssh
# 创建配置文件并写入配置
vi config
```
配置示例
```bash
# 多主机配置
Host gateway-produce
HostName [IP或绑定的域名]
Port 22
Host node-produce
HostName [IP或绑定的域名]
Port 22
Host java-produce
HostName [IP或绑定的域名]
Port 22

Host *-produce #批量处理 
User root
IdentityFile ~/.ssh/produce_key_rsa
Protocol 2
Compression yes
ServerAliveInterval 60
ServerAliveCountMax 20
LogLevel INFO

#单主机配置
Host [别名]
User root
HostName [IP或绑定的域名]
IdentityFile ~/.ssh/shownoso_rsa
Protocol 2
Compression yes
ServerAliveInterval 60
ServerAliveCountMax 20
LogLevel INFO

```

直接使用别名，假设 `Host shown`
```bash
ssh shown
```
