# WebSocket + BrowserForwarder
通过 WebSocket 的配置，服务端可以用一个真正的 HTTP 服务器接收 V2Ray 数据。而 V2Ray 4.37.0 加入的浏览器转发 (BrowserForwarder) 模块，则可以让真正的网页浏览器发送 V2Ray 数据。

如果说 HTTP 服务器隐藏了 V2Ray **服务器**，那么使用浏览器转发，浏览器隐藏了 V2Ray **客户端**。示意图如下：

```
[V2Ray client] --> [Browser] --> {Internet} --> [HTTP server] --> [V2Ray server] --> [github.com]
```

然而，最 tricky 的地方也正与浏览器有关。由于在日常使用中，浏览器往往是连上代理之后访问网络的。但是这里，浏览器成了 **V2Ray 的代理服务器**。为了尽可能让读者明白，我们重新绘制上面的图如下：

```
[Browser A] --> [V2Ray client] --> [Browser B] --> {Internet} --> [HTTP server] --> [V2Ray server] --> [github.com]
```

`Browser A` 是面向用户的浏览器， `Browser B` 则仅仅用于转发 V2Ray 流量。

如果不想用两个浏览器的话，就需要注意配置路由规则，确保浏览器是直连科学服务器的。以下配置假定用户使用同一个浏览器上网以及转发。

## 配置
在实际应用场景中，浏览器转发模块一般用在客户端。不需要额外对服务器进行额外配置。任何使用 WebSocket 作为传输配置的客户端都可以配置为使用浏览器转发。不限于 WebSocket + TLS + Web 配置方式。

### 客户端配置
我们在 WebSocket + TLS + Web 客户端配置的基础上进行修改。
```json
{
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vless",
      "settings": {
        "vnext": [
          {
            "address": "yourserver",
            "port": 443,
            "users": [
              {
                "id": "your-id",
                "encryption": "none"
              }
            ]
          }
        ]
      },
      "streamSettings":{
        "network": "ws",
        "wsSettings": {
          "path": "/yourpath",
          "useBrowserForwarding": true
        },
        "security": "tls",
        "tlsSettings": {
            "serverName": "yourserver",
            "allowInsecure": false
        }
      }
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"
    }
  ],
  "routing": {
    "rules": [
      {
        "type": "field",
        "ip": ["127.0.0.1"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "domain": ["yourserver"],
        "outboundTag": "direct"
      }
    ]
  },
  "browserForwarder": {
    "listenAddr": "127.0.0.1",
    "listenPort": 8080
  }
}
```

说明：
- `browserForwarder` 在 `listenPort` 所指定的端口上（本例是 8080 ）监听，稍后用于转发流量的浏览器需要访问此端口；
- ws 设置中的 `"useBrowserForwarding": true` 指示此 WebSocket 要由浏览器转发；
- 设置了直连 `127.0.0.1` 和你的科学服务器的路由规则；
  * 如果不直连 `127.0.0.1`， V2Ray 无法与本机浏览器进行连接；
  * 如果不直连你的科学服务器，  流量将会一直在 V2Ray 和你的浏览器之间兜圈子，你访问任何需要走 ws 的网站都会 timeout ；
  * 如果你有别的分流手段可以实现上述目的，例如使用 Privoxy ，或者使用另一个不走代理的浏览器作为转发服务器，那么可以不需要此处的分流规则；
- 也可以使用 vmess 协议取代 vless 协议。

为了使浏览器转发模块工作，还必须[下载](https://github.com/v2fly/v2ray-core/releases)与当前 V2Ray 相同版本的 v2ray-extra.zip 。并将 `browserforwarder` 目录其解压到[资源文件路径](https://www.v2fly.org/config/env.html#%E8%B5%84%E6%BA%90%E6%96%87%E4%BB%B6%E8%B7%AF%E5%BE%84)中。为了简单起见，直接解压到 `v2ray` 所在目录，类似下面的列表：

```
.
├── browserforwarder
│   ├── index.html
│   └── index.js
├── v2ray.exe
└── wv2ray.exe
```

### 作为转发服务器的浏览器配置
打开一个现代网络浏览器，例如 Firefox 或是 Chromium ，访问 `http://127.0.0.1:8080` ，使 V2Ray 连接上你的浏览器 ~~（好吧这样说有点奇怪，明明是浏览器在连接 V2Ray 客户端）~~ 。如连接成功， V2Ray 日志中应有类似于
```
2022/02/01 15:07:01 reflective server connected
```
的输出。
