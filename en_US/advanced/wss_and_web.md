# WebSocket+TLS+Web

In the previous section, we give the instruction of the configuration for TLS and WebSocket respectively. In this section, we will work with web servers and apply both TLS and WebSocket. Three examples of web servers are given here, including Nginx, Caddy and Apache. You can choose one of them, or you can use other web servers as you like. 

Many newcomers want to config in WebSocket+TLS+Web or WebSocket+TLS+Web+CDN on their first time using V2Ray, while some of them are making so big a step that they do not even understand the difference between ssh and bash. Some users chose to use Nginx / Caddy / Apache because their environment already had Nginx / Caddy / Apache which can utilize V2Ray as a back-end. Using WebSocket because Nginx / Caddy / Apache can only use WebSocket and use TLS because it can be encrypted, it obfuscates traffic like HTTPS. Maybe the configuration combination of WebSocket+TLS+Web is relatively good, but it doesn't mean that this configuration is suitable for everyone. Because this section covers Nginx / Caddy / Apache, but only the configuration examples are given without specific usage. Which means you need to understand one of these three software before try to configure them working with V2Ray together. If you don't know how to configure them, it is suggested that you learn them prior.

Note: V2Ray's Websocket+TLS configuration combination does not depend on Nginx / Caddy / Apache, instead, it works standalone.

## Configuration Example

### Server-side Configuration

For this case, TLS traffic will be handled by the Nginx / Caddy / Apache, so we need to configure them to enable TLS. Although it is not necessarily to setting your webserver to listen to 443 port, it is recommended, as it is the standard port of HTTPS. Then the traffic will be forwarded to intranet port that V2Ray's WebSocket is listening on (in this case it is 10000), V2Ray server side does not need to configure TLS.

#### v2ray Server-side Configuration

```json
{
  "inbounds": [
    {
      "port": 10000,
      "listen":"127.0.0.1",// Only listen to local host 127.0.0.1, avioding other external inspection to 10000 port 
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

#### Nginx Configuration

The domain and certificate in the following configuration is an example from "TLS" section. Please replace with yours.

```
server {
  listen 443 ssl;
  ssl on;
  ssl_certificate       /etc/v2ray/v2ray.crt;
  ssl_certificate_key   /etc/v2ray/v2ray.key;
  ssl_protocols         TLSv1 TLSv1.1 TLSv1.2;
  ssl_ciphers           HIGH:!aNULL:!MD5;
  server_name           mydomain.me;
    location /ray { # Consistent with the path of V2Ray configuration
      if ($http_upgrade != "websocket") { # Return 404 error when WebSocket upgrading negotiate failed
          return 404;
      }
      proxy_redirect off;
      proxy_pass http://127.0.0.1:10000; # Assume WebSocket is listening at localhost on port of 10000
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

#### Caddy Configuration

There's no need to indicate certificates and keys for Caddy since it will issue and renew a certificate automatically.

```
mydomain.me
{
  log ./caddy.log
  proxy /ray localhost:10000 {
    websocket
    header_upstream -Origin
  }
}
```

#### Apache Configuration

Similarly, the configuration uses the domain name and certificate from the TLS section, please replace it with your own.
```
<VirtualHost *:443>
  ServerName mydomain.me
  SSLCertificateFile /etc/v2ray/v2ray.crt
  SSLCertificateKeyFile /etc/v2ray/v2ray.key

  SSLProtocol -All +TLSv1 +TLSv1.1 +TLSv1.2
  SSLCipherSuite HIGH:!aNULL

  <Location "/ray/">
    ProxyPass ws://127.0.0.1:10000/ray/ upgrade=WebSocket
    ProxyAddHeaders Off
    ProxyPreserveHost On
    RequestHeader append X-Forwarded-For %{REMOTE_ADDR}s
  </Location>
</VirtualHost>
```

### Client-side Configuration

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
### Note

- Note that: V2Ray supports TLS1.3 since 4.18.1. If you enable and force TLS1.3, please check the v2ray client version.
- Lower version of nginx may need the "location" parameter configured to "/ray/" to work properly.
- If it can't be used successfully after the setup is complete, it may be due to the SElinux  (if you are a CentOS 7 user, please pay special attention to the SElinux) to prevent Nginx from forwarding the data to the intranet. If this is the case, there will be no access records in the V2Ray log. A large number of "Permission Denied" records will prompt in the Nginx log. To solve this problem, execute the following commands in the terminal:
  ```
  setsebool -P httpd_can_network_connect 1
  ```
- Please keep the server and client wsSettings strictly consistent. For V2Ray, `/ray` and `/ray/` are different.

### Other Notices

1. The path parameter is encrypted with TLS enabled so there's no chance for GFW to see it.
2. When proactively inspecting a path, got returned bad request cannot prove it is V2Ray;
3. The unsafe factor is user. You need to think about your own insufficiency first. Even if the path in the example is a UUID, there are still many people COPYING AND PASTING;
4. Using Header to enable forwarding is not safer than the path, don't be superstitious.

------

#### Updates

- 2017-12-05 More tips of common mistakes
- 2018-01-03 Update
- 2018-08-19 Update
- 2018-08-30 Add configuration for Apache2
- 2018-11-17 Adapted for V4.0+
- 2019-7-5   TLS 1.3 notice

