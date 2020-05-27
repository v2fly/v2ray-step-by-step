# Nginx 接管负载

这种是基于 Nginx 的 upstream 实现的负载分流, 在高性能的 VPS 的加持之下能够有效提高 Websock 的并发请求.

这里启用两个监听服务(如果 VPS 性能足够好可以设置更多)
* 127.0.0.1:10000  加载配置文件 config_slave_01.json
* 127.0.0.1:10001  加载配置文件 config_slave_02.json

## 修改配置文件

需要分出多个配置文件来进行加载
```plain
$ sudo mv /etc/v2ray/config.json /etc/v2ray/config_slave_01.json
$ sudo cp /etc/v2ray/config_slave_01.json /etc/v2ray/config_slave_02.json
```

负载的配置文件只需要修改端口和日志文件目录:
```json
{
    "log": {
        //文件区分为 xxx_slave_01, 另外配置下一个 v2ray 命令 xxx_slave_02, 依此类推分开查看日志.
        "access": "/var/log/v2ray/access_slave_01.log",
        "error": "/var/log/v2ray/error_slave_01.log",
        "loglevel": "warning"
    },
    "inbounds": [
    {
        //slave_01监听端口为10000, slave_02监听端口为10001, 不能同时占用同一个端口号, 以此类推.
        "port": 10000,
        "listen":"127.0.0.1", //只监听 127.0.0.1, 避免除本机外的机器探测到开放了 10000 端口.
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

## 修改系统服务

配置文件后, 就要把最开始 Systemctl 服务脚本修改成两个服务:
```plain
$ sudo mv /etc/systemd/system/v2ray.service /etc/systemd/system/v2ray-slave-01.service
$ sudo cp /etc/systemd/system/v2ray-slave-01.service /etc/systemd/system/v2ray-slave-02.service
```

打开系统服务文件, 找到以下类似配置行并修改:
```plain
# 修改默认加载的配置文件
ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config_slave_01.json
# 还有另外一个文件修改
ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config_slave_02.json
```

完成之后刷新 systemctl 的服务信息并且启动:
```plain
$ sudo systemctl daemon-reload
$ sudo systemctl start v2ray-slave-01.service
$ sudo systemctl start v2ray-slave-02.service

# 如果启动没问题记得设置开机启动
$ sudo systemctl enable v2ray-slave-02.service
$ sudo systemctl enable v2ray-slave-02.service
```

## 修改 Nginx 配置

打开 Nginx 配置监听文件修改:
```plain
upstream v2ray {
    # 转发数据服务
    # weight 代表了请求连接会随机分配到服务器权重,权重值越高越容易被命中
    hash $remote_addr consistent;
    server 127.0.0.1:10000 weight=3 max_fails=3 fail_timeout=30s;
    server 127.0.0.1:10001 weight=3 max_fails=3 fail_timeout=30s;
}

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
    
    # 注意这里直接将请求以 http 协议转发到名为 v2ray 的 upstream
    proxy_pass http://v2ray;
    
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

设置完成直接重启 Nginx 即可, 这样在大并发请求的时候 Nginx 会按照权重转发数据到不同的 v2ray 进程.
