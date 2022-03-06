# WebSocket + TLS + Web

前文分别提到过 TLS 和 WebSocket 的配置方法，而本文搭配 Web 服务并同时实现 TLS 和 WebSocket。关于 Web 的软件本文给出了 Nginx，Caddy 和 Apache 三个例子，三选一即可，也可以选用其它的软件。

很多新手一接触 V2Ray 就想搞 WebSocket + TLS + Web 或 WebSocket + TLS + Web + CDN，我就想问 ssh 和 vim/nano 用利索了没，步子这么大不怕扯到蛋吗？使用 Nginx/Caddy/Apache 是因为 VPS 已经有 Nginx/Caddy/Apache 可以将 V2Ray 稍作隐藏，使用 WebSocket 是因为搭配 Nginx/Caddy/Apache 只能用 WebSocket，使用 TLS 是因为可以流量加密，看起来更像 HTTPS。 也许 WebSocket + TLS + Web 的配置组合相对较好，但不意味着这样的配置适合任何人。因为本节涉及 Nginx/Caddy/Apache，只给出了配置示例而不讲具体使用方法，也就是说你在阅读本节内容前得会使用这三个软件的其中之一，如果你还不会，请自行 Google。

注意: V2Ray 的 Websocket + TLS 配置组合并不依赖 Nginx/Caddy/Apache，只是能与其搭配使用而已，没有它们也可以正常使用。

## 配置

### 服务器配置

这次 TLS 的配置将写入 Nginx/Caddy/Apache 配置中，由这些软件来监听 443 端口（443 比较常用，并非 443 不可），然后将流量转发到 V2Ray 的 WebSocket 所监听的内网端口（本例是 10000），V2Ray 服务器端不需要配置 TLS。

#### 服务器 V2Ray 配置

```json
{
  "inbounds": [
    {
      "port": 10000,
      "listen":"127.0.0.1",//只监听 127.0.0.1，避免除本机外的机器探测到开放了 10000 端口
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId": 0
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "wsSettings": {
        "path": "/ray"
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

#### 证书配置

Nginx 配置和 Apache 配置中使用的是域名和证书使用 TLS 小节的举例，请替换成自己的。因为 Caddy 会自动申请证书并自动更新，所以使用 Caddy 不用指定证书、密钥。 

注意: 如果你有的 VPS 上有架设网页，请使用 webroot 模式生成证书而不是 TLS 小节中提到的 standalone 模式。以下仅就两种模式的些微不同举例，相同部分参照 TLS 小节。本例中使用的是 ECC 证书，若要生成 RSA 证书，删去 `--keylength ec-256` 或 `--ecc` 参数即可。详细请参考 [acmesh-official/acme.sh](https://github.com/acmesh-official/acme.sh/wiki)。

证书生成

```plain
$ ~/.acme.sh/acme.sh --issue -d mydomain.me --webroot /path/to/webroot --keylength ec-256
```

安装证书和密钥

```plain
acme.sh --install-cert -d mydomain.com --ecc \
        --key-file       /etc/v2ray/v2ray.key \
        --fullchain-file /etc/v2ray/v2ray.crt \
        --reloadcmd     "service nginx force-reload"
```

#### Nginx 配置

```plain
server {
  listen 443 ssl;
  listen [::]:443 ssl;
  
  ssl_certificate       /etc/v2ray/v2ray.crt;
  ssl_certificate_key   /etc/v2ray/v2ray.key;
  ssl_session_timeout 1d;
  ssl_session_cache shared:MozSSL:10m;
  ssl_session_tickets off;
  
  ssl_protocols         TLSv1.2 TLSv1.3;
  ssl_ciphers           ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
  ssl_prefer_server_ciphers off;
  
  server_name           mydomain.me;
  location /ray { # 与 V2Ray 配置中的 path 保持一致
    if ($http_upgrade != "websocket") { # WebSocket协商失败时返回404
        return 404;
    }
    proxy_redirect off;
    proxy_pass http://127.0.0.1:10000; # 假设WebSocket监听在环回地址的10000端口上
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    # Show real IP in v2ray access.log
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

#### Caddy 配置 

::: tip
  在配置之前请先检查当前安装的 Caddy 的版本，两者的配置格式并不完全兼容。推荐使用 Caddy v2。
  注意 Caddy 在 v2.2.0-rc.1 版本以后修复了无法转发 WebSocket 的 bug，请使用以后的版本进行安装。
:::

```plain
# Caddy v2 (recommended)
mydomain.me {
    log {
        output file /etc/caddy/caddy.log
    }
    tls {
        protocols tls1.2 tls1.3
        ciphers TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384 TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256
        curves x25519
    }
    @v2ray_websocket {
        path /ray
        header Connection Upgrade
        header Upgrade websocket
    }
    reverse_proxy @v2ray_websocket localhost:10000
}
```

```plain
# Caddy v1 (deprecated)
mydomain.me
{
  log ./caddy.log
  protocols tls1.2 tls1.3
  ciphers ECDHE-ECDSA-AES128-GCM-SHA256 ECDHE-RSA-AES128-GCM-SHA256 ECDHE-ECDSA-AES256-GCM-SHA384 ECDHE-RSA-AES256-GCM-SHA384 ECDHE-ECDSA-WITH-CHACHA20-POLY1305 ECDHE-RSA-WITH-CHACHA20-POLY1305
  proxy /ray localhost:10000 {
    websocket
    header_upstream -Origin
  }
}
```

#### Apache 配置

```plain
<VirtualHost *:443>
  SSLEngine on
  
  SSLCertificateFile /etc/v2ray/v2ray.crt
  SSLCertificateKeyFile /etc/v2ray/v2ray.key
  
  SSLProtocol             all -SSLv3 -TLSv1 -TLSv1.1
  SSLCipherSuite          ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
  SSLHonorCipherOrder     off
  SSLSessionTickets       off
  
  <Location "/ray/">
    ProxyPass ws://127.0.0.1:10000/ray/ upgrade=WebSocket
    ProxyAddHeaders Off
    ProxyPreserveHost On
    RequestHeader append X-Forwarded-For %{REMOTE_ADDR}s
  </Location>
</VirtualHost>
```

### 客户端配置

```json
{
  "inbounds": [
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth",
        "udp": false
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "mydomain.me",
            "port": 443,
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "ws",
        "security": "tls",
        "wsSettings": {
          "path": "/ray"
        }
      }
    }
  ]
}
```
### 注意事项

- V2Ray 自 4.18.1 后支持 TLS1.3，如果开启并强制 TLS1.3 请注意 v2ray 客户端版本.
- 较低版本的 nginx 的 location 需要写为 /ray/ 才能正常工作
- 如果在设置完成之后不能成功使用，可能是由于 SElinux 机制(如果你是 CentOS 7 的用户请特别留意 SElinux 这一机制)阻止了 Nginx 转发向内网的数据。如果是这样的话，在 V2Ray 的日志里不会有访问信息，在 Nginx 的日志里会出现大量的 "Permission Denied" 字段，要解决这一问题需要在终端下键入以下命令：
  ```plain
  setsebool -P httpd_can_network_connect 1
  ```
- 请保持服务器和客户端的 wsSettings 严格一致，对于 V2Ray，`/ray` 和 `/ray/` 是不一样的
- 较低版本的系统/浏览器可能无法完成握手. 如 Chrome 49/XP SP3, Safari 8/iOS 8.4, Safari 8/OS X 10.10 及更低的版本. 如果你的设备比较旧, 则可以通过在配置中添加较旧的 TLS 协议以完成握手.

### 其他的话

1. 开启了 TLS 之后 path 参数是被加密的，GFW 看不到；
2. 主动探测一个 path 产生 Bad request 不能证明是 V2Ray；
3. 不安全的因素在于人，自己的问题就不要甩锅，哪怕我把示例中的 path 改成一个 UUID，依然有不少人原封不动地 COPY；
4. 使用 Header 分流并不比 path 安全， 不要迷信。
