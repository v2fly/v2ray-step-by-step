# Tor

首先是科普時間，歡迎各位直接查閱維基百科 [Tor](https://zh.wikipedia.org/wiki/Tor)。

> Tor 是實現匿名通信的自由軟件。其名源於“The Onion Router”（洋蔥路由器）的英語縮寫。用戶可透過 Tor 接達由全球志願者免費提供，包含7000+ 箇中繼的覆蓋網絡，從而達至隱藏用戶真實地址、避免網絡監控及流量分析的目的。Tor 用戶的互聯網活動（包括瀏覽在線網站、帖子以及即時消息等通信形式）相對較難追蹤。Tor 的設計原意在於保障用戶的個人隱私，以及不受監控地進行祕密通信的自由和能力。 

本篇其實是想告訴大家，V2Ray 可以和很多軟件互相配合哦，這也包括通過 V2Ray 直接流入 Tor 網絡。

## 安裝 Tor 軟件

### Arch Linux

```
# pacman -S tor
```

### Debian

```
# apt install tor
```

### CentOS

```
# yum install tor
```

## 修改 Tor 配置

於 `/etc/tor/torrc` 添加：
```
ExcludeNodes {cn},{hk},{mo},{kp},{ir},{sy},{pk},{cu},{vn}
StrictNodes 1
```

## 啓動 Tor 服務

```
# systemctl enable tor --now
```

默認端口是在 127.0.0.1:9050 哦。

## 流入 Tor 網絡

### 通過客戶端配置來達成

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

### 通過服務端配置來達成

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

## 流入並流經 Tor 網絡

最終流入 Tor 網絡會產生一個問題哦，節點跳啊跳的，或許突然跳到的一個節點剛好就無法訪問 E-Hentai 了呢。

怎麼辦呢？既然關鍵在於一個固定的節點，那就讓流入 Tor 變成流經好了，同時還要保證訪問 .onion 時不會因流出 Tor 網絡而導致無法訪問，這裏以 Shadowsocks 爲最終節點。

### 通過客戶端配置，並且由客戶端流入 Tor 網絡來達成

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

### 通過客戶端配置，並且由服務端流入 Tor 網絡來達成

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

PS：其實以 Shadowsocks 爲最終節點啊，去找些免費節點什麼的就可以直接拿來用呢（白嫖怪如是說道）。
