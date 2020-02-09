# 廣告過濾

## 配置

### 客戶端

```json
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
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
            "port": 16823,
            "users": [
              {
                "id": "2b831381d-6324-4d53-ad4f-8cda48b30811",  
                "alterId": 64
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "settings": {},
      "tag": "direct"//如果要使用路由，這個 tag 是一定要有的，在這裏 direct 就是 freedom 的一個標號，在路由中說 direct V2Ray 就知道是這裏的 freedom 了
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"//同樣的，這個 tag 也是要有的，在路由中說 adblock 就知道是這裏的 blackhole（黑洞） 了
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "domain": [
          "tanx.com",
          "googeadsserving.cn",
          "baidu.com"
        ],
        "type": "field",
        "outboundTag": "adblock"       
      },
      {
        "domain": [
          "amazon.com",
          "microsoft.com",
          "jd.com",
          "youku.com",
          "baidu.com"
        ],
        "type": "field",
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn",
          "geoip:private"
        ]
      }
    ]
  }
}
```

### 服務器

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
    {
      "port": 16823,
      "protocol": "vmess",    
      "settings": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
            "alterId": 64
          }
        ]
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

## 說明

相對於上小節，在本小節的配置變化只在於客戶端配置的 outbounds 和 routing 添加了新的內容，請大家自行比較。

在 routing 中，新添加了兩個規則：

```json
{
  "domain": [
    "tanx.com",
    "googeadsserving.cn",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "adblock"       
},
{
  "domain": [
    "amazon.com",
    "microsoft.com",
    "jd.com",
    "youku.com",
    "baidu.com"
  ],
  "type": "field",
  "outboundTag": "direct"
}
```

在第一個規則中，域名包含有 tanx.com 或 baidu.com 的就會被阻止連接，如果想攔截某些網站，往 adblock 的規則中寫想要攔截的域名就可以了。在第二個規則當中，域名中包含有 amazon.com 或 microsoft.com 或 youku.com 或 baidu.com 的會直連。有一個問題大家發現沒有，兩個規則都有 baidu.com ，那麼會執行哪個呢？答案是隻會執行第一個（即adblock)，原因是：
1. 規則是放在 routing.rules 這個數組當中，數組的內容是有順序的，也就是說在這裏規則是有順序的，匹配規則時是從上往下匹配；
2. 當路由匹配到一個規則時就會跳出匹配而不會對之後的規則進行匹配；

關於路由更多內容請參考 [V2Ray 用戶手冊](https://www.v2ray.com/chapter_02/03_routing.html)

#### 更新歷史

- 2018-11-09 跟進 v4.0+ 配置格式
- 2019-11-03 修正編輯錯誤
