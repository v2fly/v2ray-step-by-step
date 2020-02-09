# HTTP 僞裝

（**2018-03-16 注：個人建議不要使用 HTTP 僞裝**）
V2Ray 自 v2.5 版本開始提供 HTTP 僞裝功能，後經作者不斷完善，到現在已經非常成熟穩定了。V2Ray 的 HTTP 僞裝功能可以可以將 V2Ray 的流量僞裝成正常的 HTTP 協議的。這裏給出一個 HTTP 僞裝的服務器端與客戶端配置文件示例。

配置中關於 HTTP 頭字段的內容及含義，[Wikipedia](https://zh.wikipedia.org/wiki/HTTP%E5%A4%B4%E5%AD%97%E6%AE%B5%E5%88%97%E8%A1%A8) 有簡要的說明，可參閱。

## 配置

從 V2Ray 的實現角度來說，使用 HTTP 僞裝的同時完全可以使用動態端口。但我個人並不建議這麼做，因爲從實際情況來看，基本上不會有人在一個服務器上開使用多個端口的 Web 服務。如果你覺得 HTTP 僞裝的配置過於複雜不懂得如何修改，那請直接使用下面的配置即可。

### 服務器

```json
{
  "log" : {
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log",
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 80, //推薦80端口，更好地迷惑防火牆（好吧實際上並沒有什麼卵用
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "level": 1,
            "alterId": 64
          }
        ]
      },
      "streamSettings": {
        "network": "tcp",
        "tcpSettings": {
          "header": { // header 這一項是關於數據包僞裝的設置，可自定義合理的內容，但要確保服務器與客戶端一致
            "type": "http",
            "response": {
              "version": "1.1",
              "status": "200",
              "reason": "OK",
              "headers": {
                "Content-Type": ["application/octet-stream", "application/x-msdownload", "text/html", "application/x-shockwave-flash"],
                "Transfer-Encoding": ["chunked"],
                "Connection": ["keep-alive"],
                "Pragma": "no-cache"
              }
            }
          }
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "blocked"
    }
  ],
  "routing": {
    "strategy": "rules",
    "settings": {
      "rules": [
        {
          "type": "field",
          "ip": [
            "geoip:private"
          ],
          "outboundTag": "blocked"
        }
      ]
    }
  }
}
```

### 客戶端

```json
{
  "log": {
    "loglevel": "warning"
  },
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
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com",
            "port": 80,
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
        "network": "tcp",
        "tcpSettings": {
          "header": {  //這裏的 header 要與服務器保持一致
            "type": "http",
            "request": {
              "version": "1.1",
              "method": "GET",
              "path": ["/"],
              "headers": {
                "Host": ["www.cloudflare.com", "www.amazon.com"],
                "User-Agent": [
                  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.75 Safari/537.36",
                          "Mozilla/5.0 (iPhone; CPU iPhone OS 10_0_2 like Mac OS X) AppleWebKit/601.1 (KHTML, like Gecko) CriOS/53.0.2785.109 Mobile/14A456 Safari/601.1.46"
                ],
                "Accept-Encoding": ["gzip, deflate"],
                "Connection": ["keep-alive"],
                "Pragma": "no-cache"
              }
            }
          }
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
    "strategy": "rules",
    "settings": {
      "domainStrategy": "IPIfNonMatch",
      "rules": [
        {
          "type": "field",
          "ip": [
            "geoip:private"
          ],
          "outboundTag": "direct"
        },
        {
          "type": "chinasites",
          "outboundTag": "direct"
        },
        {
          "type": "chinaip",
          "outboundTag": "direct"
        }
      ]
    }
  }
}
```


----------------

#### 更新歷史

- 2017-08-05 刪掉部分不必要的配置
- 2018-03-16 Update
- 2019-01-13 V4.0+配置格式
