# TCP + TLS 分流器

这是 TCP + TLS + Web 的简易实现，不需要处理 HaProxy 和 OpenSSL 的版本问题，也不需要自己申请证书，也不需要额外安装 Web 服务器。

## 实现

1. 安装 V2Ray，可以使用官方脚本[官方脚本](https://www.v2ray.com/chapter_00/install.html#linuxscript)

2. 安装 [TLS 分流器](https://github.com/liberal-boy/tls-shunt-proxy)，见[安装说明](https://github.com/liberal-boy/tls-shunt-proxy#%E4%B8%8B%E8%BD%BD%E5%AE%89%E8%A3%85).

3. 修改 TLS 分流器配置文件(位于 `/etc/tls-shunt-proxy/config.yaml`)。

```yaml
listen: 0.0.0.0:443
vhosts:
    # 将 example.com 改为你的域名
  - name: example.com
    tlsoffloading: true
    managedcert: true
    alpn: h2,http/1.1
    # 如果不需要兼容 tls12, 可改为 tls13
    protocols: tls12,tls13
    http:
      handler: fileServer
      # /var/www/html 是静态网站目录
      args: /var/www/html
    default:
      handler: proxyPass
      args: 127.0.0.1:40001
```

4. 修改服务器 V2Ray 配置文件(位于 `/etc/v2ray/config.json`)，同 TCP + TLS + Web 方式。

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

5. 重启服务

 ```shell
 systemctl restart tls-shunt-proxy
 systemctl restart v2ray
 ```

6. 客户端连接 `example.com:443 vmess tls` 即可

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

## Domain Socket

相比 TCP，Domain Socket (以下简称 DS) 更为高效。根据测试反馈，速度超过 50Mbps 时，通常会有较明显的性能差距。

DS 仅限分流器与服务端 V2Ray 连接，客户端连接服务器仍然使用 TCP, 即：
```text
              TLS over TCP                DS
客户端 V2Ray --------------- TLS 分流器 -------- 服务端 V2Ray
``` 

1. 修改分流器配置文件(位于 `/etc/tls-shunt-proxy/config.yaml`)

```yaml
listen: 0.0.0.0:443
vhosts:
    # 将 example.com 改为你的域名
  - name: example.com
    tlsoffloading: true
    managedcert: true
    alpn: h2,http/1.1
    # 如果不需要兼容 tls12, 可改为 tls13
    protocols: tls12,tls13
    http:
      handler: fileServer
      # /var/www/html 是静态网站目录
      args: /var/www/html
    default:
      handler: proxyPass
      args: unix:@v2ray.sock
```

2. 修改服务器 V2Ray 配置文件(位于 `/etc/v2ray/config.json`)。

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
                "network": "ds",
                "dsSettings": {
                     "path": "@v2ray.sock",
                     "abstract": true
                }

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

3. 确保按 [此建议](https://github.com/v2ray/v2ray-core/issues/1011) 配置了 `v2ray` 用户。

4. 修改 V2Ray 的 systemd 配置文件(位于 `/etc/systemd/system/v2ray.service`)

::: warning
部分系统中可能需要修改 rm, mkdir, sleep, chmod 所在的目录。
:::

```text
[Unit]
Description=V2Ray - A unified platform for anti-censorship
Documentation=https://v2ray.com https://guide.v2fly.org
After=network.target nss-lookup.target
Wants=network-online.target

[Service]
# If the version of systemd is 240 or above, then uncommenting Type=exec and commenting out Type=simple
#Type=exec
Type=simple
# Runs as root or add CAP_NET_BIND_SERVICE ability can bind 1 to 1024 port.
# This service runs as root. You may consider to run it as another user for security concerns.
# By uncommenting User=v2ray and commenting out User=root, the service will run as user v2ray.
# More discussion at https://github.com/v2ray/v2ray-core/issues/1011
#User=root
User=v2ray
CapabilityBoundingSet=CAP_NET_BIND_SERVICE CAP_NET_RAW
NoNewPrivileges=yes

ExecStartPre=/usr/bin/mkdir -p /tmp/v2ray-ds
ExecStartPre=/usr/bin/rm -rf /tmp/v2ray-ds/*.sock

ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json

ExecStartPost=/usr/bin/sleep 1
ExecStartPost=/usr/bin/chmod 777 /tmp/v2ray-ds/v2ray.sock

Restart=on-failure
# Don't restart in the case of configuration error
RestartPreventExitStatus=23

[Install]
WantedBy=multi-user.target
```

5. 重启服务
  
```shell
systemctl daemon-reload
systemctl restart v2ray
systemctl restart tls-shunt-proxy
```

## 其他

* TLS 分流器还可以实现 vmess + TLS + Web 和 trojan 共享端口
* 具体配置参数请参阅项目 [README](https://github.com/liberal-boy/tls-shunt-proxy/blob/master/README.md)
