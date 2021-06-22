# MTProto 代理

V2ray 内实现了一个让[telegram](https://telegram.org/)使用的代理 MTProto。 MTProto 是 Telegram 官方开发的代理协议，只能由 Telegram 程序使用。

## 现状和建议

到目前为止（2020 年 3 月），因为防火墙的探测封锁，MTProto 协议已经迭代了三代；而 V2ray 内置的支持 MTProto 只有第一代，直接部署会受到防火墙的精准探测和封锁，因此这里**并不推荐使用 V2ray 提供 MTProto 服务**，而推荐使用专业的 MTProto 程序，并配置使用最新的第三代 FakeTLS 模式：

* [9seconds / mtg](https://github.com/9seconds/mtg) (GO 语言实现)
* [seriyps / mtproto_proxy](https://github.com/seriyps/mtproto_proxy) (Erlang 实现)
* [alexbers / mtprotoproxy](https://github.com/alexbers/mtprotoproxy) (Python 实现)
* [TelegramMessenger / MTProxy](https://github.com/TelegramMessenger/MTProxy) (Telegram 官方)

目前 [9seconds / mtg](https://github.com/9seconds/mtg) 提供的 Version 2 支持前置 socks5 代理设置，可以与 V2ray 搭配使用，实现 MTProto 的墙内转发。


::: tip 提示
MTProto 可通过 secret 字段区分三代的区别：

* 第一代 secret 为 32 位 16 进制字符；
* 第二代 secret 为`dd`开头加 32 位 16 进制字符，一共 34 位；
* 第三代 secret 为`ee`开头加不定长的字符，也叫 FakeTLS 模式；
:::


## V2Ray 的 MTProto 墙内转发

::: warning 提醒
目前在境内架设转发代理服务或许有法律风险，建议仅个人使用。
:::

如果一定要使用 V2ray 提供的 MTProto 代理，可以通过在家庭网关配合境外服务器转发实现，以下摘录 V2ray 作者博客：（原文连接：[如何使用 V2Ray 中新增的 MTProto 代理](https://steemit.com/cn/@v2ray/v2ray-mtproto)）


------

V2Ray 从 3.29 开始增加了一组新的[传入传出协议：MTProto Proxy](https://www.v2fly.org/chapter_02/protocols/mtproto.html)。这个协议是 Telegram 开发的，仅用于 Telegram 流量的代理。

上述的链接中已经附了一个简单的配置方式，这里介绍一个较复杂的用法。

由于 MTProto 是一组对应的传入传出，它实际上没有用到 V2Ray 的优势，比如 TLS + WebSocket。当这个代理有朝一日被检测并屏蔽的时候，简单的搭配可能就用不了了。

如果真到了那么一天，你可能需要在墙内搭一个中传服务器，在这个服务器上接收 MTProto 传入，然后用 VMess 或其它协议把流量中转到墙外，这样被屏蔽的可能性更低。

好了，具体要怎么配置呢？

首先一组传入传出加路由是没有疑问的：

```json
{
  "tag": "tg-in",
  "port": 443,
  "protocol": "mtproto",
  "settings": {
    "users": [{"secret": "b0cbcef5a486d9636472ac27f8e11a9d"}]
  }
}
```

```json
{
  "tag": "tg-out",
  "protocol": "mtproto",
  "settings": {}
}
```

```json
{
  "type": "field",
  "inboundTag": ["tg-in"],
  "outboundTag": "tg-out"
}
```

然后，如果你有一个另外的 VMess 传出，比如你买了一个商用的 VMess 代理，假设配置如下：

```json
{
  "tag": "vmess-out",
  "protocol": "vmess",
  "settings": {
    "vnext": [{
      "address": "v2ray.com",
      "port": 443,
      "users": [{"id": "27848739-7e62-4138-9fd3-098a63964b6b"}]
    }]
  }
}
```

然后我们把 tg-out 和 vmess-out 桥接起来就可以了，做法很简单，在 tg-out 上加一个 proxySettings：

```json
{
  "tag": "tg-out",
  "protocol": "mtproto",
  "settings": {},
  "proxySettings": {
    "tag": "vmess-out"  // 把 tg-out 的流量由 vmess-out 转发
  }
}
```

这样就可以让流量走一个类似 tg-in <-> vmess-out <-> vmess-in <-> tg-out 的转发方式。

当然 V2Ray 有其它的自由组合，比如你也可以使用 dokodemo 做透明代理完成上述的中转。但上述做法的好处是，你可以使用第三方的代理（比如买来的），这种情况下没办法修改代理服务器的配置。使用 proxySettings 可以在不修改下一个代理节点，仅修改当前节点配置的情况下，实现任意协议的中转。


## 使用 mtg Version 2 搭配 V2Ray 搭建 MTProto

::: warning 提醒
目前在境内架设转发代理服务或许有法律风险，建议仅个人使用。
:::

首先需要使用 V2Ray 或是其他代理软件在本地回环地址创建一个 socks5 代理用于连接 Telegram 的服务器，并将其流量通过隧道传出。代理出口可以为自己购买的 VPS 也可以使用购买来的相关服务。

下面给出使用 V2Ray 最简单的配置：


```json
{
  "inbounds": [
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "socks"
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "example.org",
            "port": 1234,
            "users": [
              {
                "id": "your uuid",
                "alterId": 0,
                "security": "auto"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

该配置在主机的本地回环地址的 1080 端口创建了一个 socks5 传入，并将其通过 VMess 传出，需要根据自己的实际情况进行修改。

随后可以对该配置进行测试，例如使用 curl 工具测试一下是否可以访问谷歌:

`curl https://google.com -x socks5://127.0.0.1:1080`

正常情况下谷歌会返回一个 301 跳转的指令，例如：

```html
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="https://www.google.com/">here</A>.
</BODY></HTML>
```

返回上述结果表示本地的 socks5 代理可以使用，将配置好的 socks5 代理作为服务启动并设定好开机自启。

随后从 [9seconds / mtg](https://github.com/9seconds/mtg) 项目的 Releases 中根据自己的服务器架构下载对应的二进制打包文件，并将其解包，使用 `root` 权限将其中的二进制文件 `mtg` 复制到目录 `/usr/local/bin/` 下。复制完成后检查一下文件 `/usr/local/bin/mtg` 的权限，需要所有用户可读可执行。

使用命令 `mtg generate-secret example.com` 生成一个连接用密钥，其中域名可以自定义。按照 [9seconds / mtg](https://github.com/9seconds/mtg) 项目文档里的说法，建议使用一个与安装服务的 VPS 相关的域名，例如使用的阿里云的服务器，就使用类似于 `aliyun.com` 之类的域名。密钥生成完成后复制下来，例如 `7tTr01QmYIE1csd8stb-KCRleGFtcGxlLmNvbQ`。默认情况下密钥为 Base64 编码，实际上已经是 FakeTLS 模式了。

随后使用 `root` 权限新建文件 `/etc/mtg.toml` ，写入如下内容并保存：

```toml
secret = "secret" # 引号中填写自己生成的密钥
bind-to = "0.0.0.0:8443" # 监听用的地址与端口，使用地址 0.0.0.0 监听所有地址

[network]
proxies = [
    "socks5://127.0.0.1:1080" # 本地的 socks5 代理
]
```

使用命令 `mtg run /etc/mtg.toml` 在终端中运行程序，然后使用 Telegram 客户端配置使用该 MTProto 代理，测试是否可用。

测试完成后，使用 `Ctrl+C` 中断程序运行，使用 `root` 权限创建并编辑一个服务文件 `/etc/systemd/system/mtg.service` ，写入如下内容并保存：

```conf
[Unit]
Description=mtg
After=network.target nss-lookup.target

[Service]
User=nobody
Group=nogroup
Type=simple
ExecStart=/usr/local/bin/mtg run /etc/mtg.toml
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

使用 `root` 权限执行如下命令重新载入 service 文件，启动 mtg 服务并设定为开机自启：

```shell
$ systemctl daemon-reload
$ systemctl start mtg
$ systemctl enable mtg
```

正常情况下就可以使用该 MTProto 代理了。

其实 mtg 本身有生成分享链接的功能，在 mtg 后台服务启动后使用命令 `mtg access /etc/mtg.toml` 可以生成一个便于分享用的链接、二维码等信息的 json 信息，但该程序默认是使用获取公网地址的 API 生成分享链接中的服务器地址，在本使用环境中该地址会变成 socks5 代理服务的网络出口地址，是不能使用的。

可以将公网地址作为参数输入解决这个问题，例如使用命令 `mtg access -i 1.2.3.4 -I 2001:2:3::4 /etc/mtg.toml` 将 ipv4 与 ipv6 地址设定为 `1.2.3.4` 与 `2001:2:3::4`，这样就避免了程序使用 API 获取到错误地址的问题。
