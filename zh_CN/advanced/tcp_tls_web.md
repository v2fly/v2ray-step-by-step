# TCP + TLS + Web

新手建议使用 [TLS 分流器](https://guide.v2fly.org/advanced/tcp_tls_shunt_proxy.html) 方案

## 背景

* 目前 Vmess + WebSocket + TLS （以下简称 wss）方式，因其特征如同 HTTPS 流量，可以隐藏 V2Ray 路径，主动侦测会得到正常 HTTP 网站响应，具有良好的伪装能力，目前被广泛用于反审查。  

* 但是如此强大的伪装能力，需要付出严重的性能代价：TLS 1.3 握手需要消耗 1-rtt，WS 握手也需要消耗 1-rtt，增大了握手延迟。V2Ray 增加了 mux 以减少握手的发生，然而实际使用中 mux 体验并不好，很多用户选择关闭。

* 最近兴起了一个新的反审查工具——[Trojan](https://github.com/trojan-gfw/trojan)，这个工具将一个类似 Socks 的协议直接通过 TLS 传输，并将认证失败的流量交由 Web 服务器处理。降低 WS 延迟的同时，提供与 wss 方式一样的伪装能力。但是该工具较为年轻，没有路由功能，各平台图形化客户端也不完善。

* 因此，本人尝试用 V2Ray 实现类似功能，即 Vmess + TCP + TLS 并网站伪装，省下 WS 的握手延迟。

## 原理

HaProxy 监听 443 端口，处理 TLS 之后，将 HTTP 流量交由 Web 服务器处理，非 HTTP 流量交由 V2Ray 按 Vmess 处理。

## 实现

本次方案使用 HaProxy，Caddy/Nginx（Web 服务器的使用不是本教程的重点，可以用 httpd 等替代），V2Ray，服务器系统为 Debian 10。  

1. 安装 HaProxy `apt install haproxy`

* 为了较好的支持 TLS1.3，HaProxy 版本应大于 1.8.15，OpenSSl 版本应大于 1.1.1，如果您使用的发行版仓库自带的版本较低，您可能需要自行编译安装。

2. 安装 Web 服务器，Caddy 参考[这个教程](https://github.com/caddyserver/caddy/blob/v1/dist/init/linux-systemd/README.md)，Nginx 使用命令 `apt install nginx`安装。

3. 安装 V2Ray，可以使用官方脚本[官方脚本](https://www.v2fly.org/guide/install.html#%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC)

4. 修改 V2Ray 配置文件，以 Vmess + TCP 方式监听 40001 端口。

```json
{
    "inbounds": [
        {
            "protocol": "vmess",
            "listen": "127.0.0.1",
            "port": 40001,
            "settings": {
                "clients": [
                    {
                        "id": "f2435e5c-9ad9-4367-836a-8341117d0a5f"
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp"
            }
        }
    ],
    "outbounds": [
        {
            "protocol": "freedom"
        }
    ]
}
```

5. 修改 Web 服务器配置文件，部署 HTTP 服务于 8080 端口。

Caddy 直接替换
```cfg
http://example.com:8080 {
    root /var/www/html
}
```

Nginx 在 http{} 里面添加
```conf
server {
  listen 8080;
  server_name example.com;
  root /var/www/html;
}
```

* 注：/var/www/html 是静态网站目录

* 实际服务请根据需要部署，也可以用 httpd 之类的替代

* 似乎很多 Trojan 教程直接监听 80 端口，其实很多 HTTPS 网站 80 端口通常是重定向到 HTTPS

6. 修改 HaProxy 配置文件。

```cfg
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin expose-fd listeners
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    ca-base /etc/ssl/certs
    crt-base /etc/ssl/private

    # 仅使用支持 FS 和 AEAD 的加密套件
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384
    ssl-default-bind-ciphersuites TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256
    # 禁用 TLS 1.2 之前的 TLS
    ssl-default-bind-options no-sslv3 no-tlsv10 no-tlsv11

    tune.ssl.default-dh-param 2048

defaults
    log global
    # 我们需要使用 tcp 模式
    mode tcp
    option dontlognull
    timeout connect 5s
    # 空闲连接等待时间，这里使用与 V2Ray 默认 connIdle 一致的 300s
    timeout client  300s
    timeout server  300s

frontend tls-in
    # 监听 443 tls，tfo 根据自身情况决定是否开启，证书放置于 /etc/ssl/private/example.com.pem
    bind *:443 tfo ssl crt /etc/ssl/private/example.com.pem
    tcp-request inspect-delay 5s
    tcp-request content accept if HTTP
    # 将 HTTP 流量发给 web 后端
    use_backend web if HTTP
    # 将其他流量发给 vmess 后端
    default_backend vmess

backend web
    server server1 127.0.0.1:8080
  
backend vmess
    server server1 127.0.0.1:40001
```

* HaProxy 的证书和密钥放于同一个文件，与 Caddy 和 Nginx 不同，可以使用命令 `cat example.com.crt example.com.key > example.com.pem` 合成证书

7. 重启服务

 ```shell
 systemctl restart haproxy
 systemctl restart caddy
 systemctl restart v2ray
 ```

8. 客户端连接 `example.com:443 vmess tls` 即可

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
                        "address": "example.com",
                        "port": 443,
                        "users": [
                            {
                                "id": "f2435e5c-9ad9-4367-836a-8341117d0a5f",
                                "security": "none"
                            }
                        ]
                    }
                ]
            },
            "streamSettings": {
                "network": "tcp",
                "security": "tls"
            }
        }
    ]
}
```

## 效果

![延迟对比](https://i.loli.net/2020/02/18/tQyKPD45fmAFl9x.jpg)

* 测试工具为 [vmessping](https://github.com/v2fly/vmessping)，可见 Vmess + TCP + TLS（左）延迟低于 Vmess + WSS（右）

* 打开网站域名可以看到正常的网站。

## 讨论

* HaProxy，V2Ray，Nginx 都是支持 Domain Socket 的，流量较大或数据包较多时使用 ds 可以提高性能，本教程不做展开，可以参考[这篇文章](https://gist.github.com/liberal-boy/b2d5597285b4202b6d607faaa1078d27)。

* 可以使用[这个工具](https://github.com/pierky/haproxy-ocsp-stapling-updater)开启 `OCSP Stapling` 减少客户端验证证书的时间。

+ 该方法的隐蔽性是否比 wss 低？
    * 中间人看来，该方法在建立 TLS 连接后，比 wss 少一次握手，即 TLS 建立后直接发送请求并获得响应，该行为是符合正常的 HTTPS 请求的。
    * 主动探测时，如 TLS 建立后发送 HTTP 请求，则被发给 Web 服务器按正常 HTTP 请求处理。如发送非 HTTP 请求，会被发给 V2Ray 处理，如 Vmess 认证失败，连接将被关闭，向 HTTPS 服务器发送非 HTTPS 请求，连接被关闭是正常的行为。
    * 如果您还认为存在被检测的的可能，请提出检测方法。
