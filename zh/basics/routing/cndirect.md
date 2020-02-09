# 國內直連

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
        "auth": "noauth",
        "udp": true
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
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
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
      "tag": "direct" //如果要使用路由，這個 tag 是一定要有的，在這裏 direct 就是 freedom 的一個標號，在路由中說 direct V2Ray 就知道是這裏的 freedom 了
    }    
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"] // 中國大陸主流網站的域名
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn", // 中國大陸的 IP
          "geoip:private" // 私有地址 IP，如路由器等
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
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811"
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

看客戶端配置，注意 routing 有一個 domainStrategy， 跟着寫就行，當然也可以設成其它的，這裏我不說，想知道就看用戶手冊。重點在 rules，我們要設置的路由規則就放在這裏，注意這是一個數組，也就是說可以設置多個路由規則，當訪問一個網站，數據包進入 V2Ray 之後路由就會先看看有沒有能夠匹配的規則，然後執行規則。

在rules 數組中的每個規則由一組大括號`{ }`擴起來。規則中的 type 是固定的(也就是照抄就行)， 兩個規則分別有 `"domain": ["geosite:cn"]` 和 `"ip": ["geoip:cn"]`，這兩個分別包含了中國大陸主流網站大部分域名和幾乎所有的 ip 。兩個規則的 outboundTag 都是 direct （outbounds 中 tag 爲 direct 的是 freedom）那麼如果訪問了國內的網站路由就會將這個數據包發往 freedom，也就是直連了。比如說我訪問了 qq.com，qq.com 是國內網站包含在 chinasites 裏，就會匹配路由規則發往 freedom。

也許有的朋友會覺得奇怪，在這個例子當中路由規則只有國內網站直連，沒有關於走代理的規則，但仍然可以訪問 google.com、twitter.com 這類等衆多被牆的網站的。這因爲 `outbounds` 中的第一個出口協議是作爲默認的出口，當一個數據包沒有匹配的規則時，路由就會把數據包發往默認出口，在本例中 VMess 位於 `outbounds` 中的第一個，即不是訪問中國大陸網站的數據包將通過 VPS 代理。

服務器配置與前面 VMess 一樣，不再贅述。

-----
到這裏爲止的配置已經可以滿足基本的翻牆需求了。但是如果僅僅止步於此，那麼也沒什麼使用 V2Ray 的必要，還不如用 Shadowsocks，畢竟 Shadowsocks 的配置不過 10 行，網上文章又多。

指南到這裏還沒完結，後面還有許多強大的功能等着我們來挖掘呢。少年，來吧！

#### 更新歷史

- 2018-11-09 跟進 v4.0+ 配置格式
