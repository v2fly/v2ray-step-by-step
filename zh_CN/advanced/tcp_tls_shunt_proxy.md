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

## 高级

* TLS 分流器还可以实现 vmess + TLS + Web 和 trojan 共享端口
* 对性能要求高可以使用 domain socket
* 具体配置参数请参阅项目 [README](https://github.com/liberal-boy/tls-shunt-proxy/blob/master/README.md)