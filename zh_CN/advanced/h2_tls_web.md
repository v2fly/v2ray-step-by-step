# HTTP/2+TLS+WEB

```text
V2RayClient --|-> Caddy -> V2RayServer -> Internet
```

流量经 Caddy 通过本地回环（lo）转发给V2Ray，如直接使用浏览器访问 *V2Ray Path* 将会返回 502 Bad Gateway，直接打开域名或访问其他路径与通过HTTP/2访问普通网站一般无二。每一个请求都是真实的 HTTP/2 `PUT`,正所谓真实是最完美的伪装。

::: tip CDN
<!--如果有人试过可以套CF，请将括号内容删除。否则修改这一行-->
H2流量理论上跟ws一样可以被 Cloudflare 转发，记得在 dashboard 里打开HTTP/2开关。<sup>*（注意：笔者没有进行实际测试）*</sup>
:::

## 缺陷

- 没有使用 [h2c](https://v2ray.com/chapter_00/01_versions.html#20190712-v4200)
- 没有使用 [DomainSocket](https://v2ray.com/chapter_02/transport/domainsocket.html)
- 其他尚未注明的缺陷，急需你的补充。

## 服务端配置

::: tip 建议的部署顺序
*先配置 Web 服务器，待 Web 服务器正常工作后部署 V2Ray。*
:::

本文之示例配置尚未使用 `h2c`，故 V2Ray 和 Caddy 均需要配置SSL证书。

需要自行修改的内容已使用 *\<CustomTag\>* 标注，部署时请注意修改。

TAG | 说明
:-|:-
\<Host\> | 服务器的域名
\<Port\> | V2Ray 在本地回环（lo）中监听的端口。
\<UUID\> | VMess 用户的主ID。必须是一个合法的UUID。
\<H2 Path\> | 以“/”开头的HTTP路径，客户端与服务端必须一致。
\<Path to cert\><br>\<Path to key\> | 指向证书/密钥的绝对路径
\<Path to webroot\> | 指向 Web 页面根目录的绝对路径

### 前期准备

- 注册域名并正确配置域名解析
- 准备好SSL证书 *（如果需要使用 Caddy 管理SSL证书，请自行修改 Caddyfile）*
- 完成 V2Ray 和 Web 服务器（例如 Caddy）的安装
- 准备一些人畜无害的HTML页面用来挡刀

### Web 服务器

此处需要使用能转发 HTTP/2 流量的 Web 服务器。本文以 Caddy 1 的配置文件 `Caddyfile` 为例，其他 Web 服务器同理。

::: warning 
NGINX 不能向后端转发 HTTP2 流量。<sup id="a1">[1](#f1)</sup>
:::

下面的配置假定你已经拥有现成的SSL证书，如果需要使用 Caddy 管理SSL证书，请自行修改 `tls` 部分。

::: details Caddyfile
```caddyfile
http://<Host> {
    redir https://<Host>{url}
}

https://<Host> {
    log stdout
    errors stderr
    root <Path to webroot>
    tls <Path to cert> <Path to key>
    proxy <H2 Path> https://localhost:<Port> {
        insecure_skip_verify
        header_upstream Host {host}
        header_upstream X-Real-IP {remote}
        header_upstream X-Forwarded-For {remote}
        header_upstream X-Forwarded-Port {server_port}
        header_upstream X-Forwarded-Proto "https"
}
```
:::

### V2Ray

下列配置不包含 [log](/basics/log) 部分。

::: details V2Ray config.json
```json
{
  "inbounds": [
    {
      "port": "<Port>",
      "listen": "127.0.0.1",
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "<UUID>",
            "alterId": 64
          }
        ]
      },
      "streamSettings": {
        "network": "h2",
        "security": "tls",
        "httpSettings": {
          "path": "<H2 Path>",
          "host": [
            "<Host>"
          ]
        },
        "tlsSettings": {
          "serverName": "<Host>",
          "certificates": [
            {
              "certificateFile": "<Path to cert>",
              "keyFile": "<Path to key>"
            }
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    }
  ]
}
```
:::

## 排错

- 如果你后端的 V2Ray 挂了或配置不正确，访问 *\<H2 Path\>* 仍然会返回 `502`，因此不能通过 `502` 错误判断 V2Ray 正在运行。
- 同时检查 V2Ray 和 Caddy 的日志，有助于确定问题出在哪一部分。

## 参考文献

<b id="f1">1.</b> v2ray-core [#1063](https://github.com/v2ray/v2ray-core/issues/1063)[↩](#a1)
