# WebSocket + TLS + Web

前文分別提到過 TLS 和 WebSocket 的配置方法，而本文搭配 Web 服務並同時實現 TLS 和 WebSocket。關於 Web 的軟件本文給出了 Nginx，Caddy 和 Apache 三個例子，三選一即可，也可以選用其它的軟件。

很多新手一接觸 V2Ray 就想搞 WebSocket + TLS + Web 或 WebSocket + TLS + Web + CDN，我就想問 ssh 和 vim/nano 用利索了沒，步子這麼大不怕扯到蛋嗎？使用 Nginx/Caddy/Apache 是因爲 VPS 已經有 Nginx/Caddy/Apache 可以將 V2Ray 稍作隱藏，使用 WebSocket 是因爲搭配 Nginx/Caddy/Apache 只能用 WebSocket，使用 TLS 是因爲可以流量加密，看起來更像 HTTPS。 也許 WebSocket + TLS + Web 的配置組合相對較好，但不意味着這樣的配置適合任何人。因爲本節涉及 Nginx/Caddy/Apache，只給出了配置示例而不講具體使用方法，也就是說你在閱讀本節內容前得會使用這三個軟件的其中之一，如果你還不會，請自行 Google。

注意: V2Ray 的 Websocket + TLS 配置組合並不依賴 Nginx/Caddy/Apache，只是能與其搭配使用而已，沒有它們也可以正常使用。

## 配置

### 服務器配置

這次 TLS 的配置將寫入 Nginx/Caddy/Apache 配置中，由這些軟件來監聽 443 端口（443 比較常用，並非 443 不可），然後將流量轉發到 V2Ray 的 WebSocket 所監聽的內網端口（本例是 10000），V2Ray 服務器端不需要配置 TLS。

#### 服務器 V2Ray 配置 

```json
{
  "inbounds": [
    {
      "port": 10000,
      "listen":"127.0.0.1",//只監聽 127.0.0.1，避免除本機外的機器探測到開放了 10000 端口
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId": 64
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

#### Nginx 配置

配置中使用的是域名和證書使用 TLS 小節的舉例，請替換成自己的。

```
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
    location /ray { # 與 V2Ray 配置中的 path 保持一致
      if ($http_upgrade != "websocket") { # WebSocket協商失敗時返回404
          return 404;
      }
      proxy_redirect off;
      proxy_pass http://127.0.0.1:10000; # 假設WebSocket監聽在環回地址的10000端口上
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

因爲 Caddy 會自動申請證書並自動更新，所以使用 Caddy 不用指定證書、密鑰。  

```
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

同樣地，配置中使用的是域名和證書使用 TLS 小節的舉例，請替換成自己的。
```
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

### 客戶端配置

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
### 注意事項

- V2Ray 自4.18.1後支持TLS1.3，如果開啓並強制 TLS1.3 請注意v2ray客戶端版本.
- 較低版本的nginx的location需要寫爲 /ray/ 才能正常工作
- 如果在設置完成之後不能成功使用，可能是由於 SElinux 機制(如果你是 CentOS 7 的用戶請特別留意 SElinux 這一機制)阻止了 Nginx 轉發向內網的數據。如果是這樣的話，在 V2Ray 的日誌裏不會有訪問信息，在 Nginx 的日誌裏會出現大量的 "Permission Denied" 字段，要解決這一問題需要在終端下鍵入以下命令：
  ```
  setsebool -P httpd_can_network_connect 1
  ```
- 請保持服務器和客戶端的 wsSettings 嚴格一致，對於 V2Ray，`/ray` 和 `/ray/` 是不一樣的
- 較低版本的系統/瀏覽器可能無法完成握手. 如 Chrome 49/XP SP3, Safari 8/iOS 8.4, Safari 8/OS X 10.10 及更低的版本. 如果你的設備比較舊, 則可以通過在配置中添加較舊的 TLS 協議以完成握手.

### 其他的話

1. 開啓了 TLS 之後 path 參數是被加密的，GFW 看不到；
2. 主動探測一個 path 產生 Bad request 不能證明是 V2Ray；
3. 不安全的因素在於人，自己的問題就不要甩鍋，哪怕我把示例中的 path 改成一個 UUID，依然有不少人原封不動地 COPY；
4. 使用 Header 分流並不比 path 安全， 不要迷信。
