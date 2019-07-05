# Ads Filtering

## Configuration Example

### Client-side

```javascript
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
      "tag": "direct"//如果要使用路由，这个 tag 是一定要有的，在这里 direct 就是 freedom 的一个标号，在路由中说 direct V2Ray 就知道是这里的 freedom 了
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"//同样的，这个 tag 也是要有的，在路由中说 adblock 就知道是这里的 blackhole（黑洞） 了
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
        "outboundTag": "direct"，
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

### Server-side

```javascript
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

## Explanation

Comparing with last section, this only adding new content to outbounds and routing in configuration.

In routing section, two rules are added:

```javascript
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

In the first rule added, connection would be denied if the domain contains tanx.com or baidu.com. If you want to fitler out some connections to specific domains, just add those into the adblock rule.
In the second rule,  if domains are amazon.com, microsoft.com, youku.com, or baidu.com, connection would go through direct route. Consider baidu.com appeared in both rules, only the first would be actually implement (which is adblock), because:
1. rules are stored in routing.rules vector, which is in-order data structure, and the rule matching process would follow the order.
2. Therefore it would only apply the match that dispatcher first hits.

For more information, please refer [V2Ray Official Guide](https://v2fly.org/chapter_02/03_routing.html).

## Updates

- 2018-11-09 Adapt to v4.0+ configuration format.
