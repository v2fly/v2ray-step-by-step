# Tor

首先是科普时间，欢迎各位直接查阅维基百科 [Tor](https://zh.wikipedia.org/wiki/Tor)。

> Tor 是实现匿名通信的自由软件。其名源于“The Onion Router”（洋葱路由器）的英语缩写。用户可透过 Tor 接达由全球志愿者免费提供，包含 7000+ 个中继的覆盖网络，从而达至隐藏用户真实地址、避免网络监控及流量分析的目的。Tor 用户的互联网活动（包括浏览在线网站、帖子以及即时消息等通信形式）相对较难追踪。Tor 的设计原意在于保障用户的个人隐私，以及不受监控地进行秘密通信的自由和能力。 

本篇其实是想告诉大家，V2Ray 可以和很多软件互相配合哦，这也包括通过 V2Ray 直接流入 Tor 网络。

## 安装 Tor 软件

### Arch Linux

```plain
# pacman -S tor
```

### Debian

```plain
# apt install tor
```

### CentOS

```plain
# yum install tor
```

## 修改 Tor 配置

于 `/etc/tor/torrc` 添加：
```plain
ExcludeNodes {cn},{hk},{mo},{kp},{ir},{sy},{pk},{cu},{vn}
StrictNodes 1
```

## 启动 Tor 服务

```plain
# systemctl enable tor --now
```

默认端口是在 127.0.0.1:9050 哦。

## 流入 Tor 网络

### 通过客户端配置来达成

```json
...
    "outbounds": [
        {
            "protocol": "socks",
            "settings": {
                "servers": [
                    {
                        "address": "127.0.0.1",
                        "port": 9050
                    }
                ]
            },
            "proxySettings": {
                "tag": "transit"
            }
        },
        {
            ...
            "tag": "transit"
        }
    ]
...
```

### 通过服务端配置来达成

```json
...
    "outbounds": [
        {
            "protocol": "socks",
            "settings": {
                "servers": [
                    {
                        "address": "127.0.0.1",
                        "port": 9050
                    }
                ]
            }
        }
    ]
...
```

## 流入并流经 Tor 网络

最终流入 Tor 网络会产生一个问题哦，节点跳啊跳的，或许突然跳到的一个节点刚好就无法访问 E-Hentai 了呢。

怎么办呢？既然关键在于一个固定的节点，那就让流入 Tor 变成流经好了，同时还要保证访问 .onion 时不会因流出 Tor 网络而导致无法访问，这里以 Shadowsocks 为最终节点。

### 通过客户端配置，并且由客户端流入 Tor 网络来达成

```json
...
    "routing": {
        "strategy": "rules",
        "settings": {
            "rules": [
                {
                    "type": "field",
                    "domain": [
                        "regexp:\\.onion$"
                    ],
                    "outboundTag": "transit"
                }
            ]
        }
    },
...
    "outbounds": [
        {
            "protocol": "shadowsocks",
            "settings": {
                "servers": [
                    {
                        ...
                    }
                ]
            },
            "proxySettings": {
                "tag": "transit"
            }
        },
        {
            "protocol": "socks",
            "settings": {
                "servers": [
                    {
                        "address": "127.0.0.1",
                        "port": 9050
                    }
                ]
            },
            "tag": "transit"
        }
    ]
...
```

### 通过客户端配置，并且由服务端流入 Tor 网络来达成

```json
...
    "routing": {
        "strategy": "rules",
        "settings": {
            "rules": [
                {
                    "type": "field",
                    "domain": [
                        "regexp:\\.onion$"
                    ],
                    "outboundTag": "transit"
                }
            ]
        }
    },
...
    "outbounds": [
        {
            "protocol": "shadowsocks",
            "settings": {
                "servers": [
                    {
                        ...
                    }
                ]
            },
            "proxySettings": {
                "tag": "transit"
            }
        },
        {
            ...
            "tag": "transit"
        }
    ]
...
```

PS：其实以 Shadowsocks 为最终节点啊，去找些免费节点什么的就可以直接拿来用呢（白嫖怪如是说道）。
