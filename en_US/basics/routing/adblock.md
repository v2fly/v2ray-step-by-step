# Ads Filtering

## Configuration

### Client-side configuraion

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
      "tag": "direct"// If you want to use routing feature, this tag is necessary. Here direct is a tag of freedom. Then we use directly to tell V2ray, use freedom outbound.
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "adblock"// As same as direct, this tag is necessary. Then we used adblock tag to tell V2ray point these links to blackhole.
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

### Server-side configuration

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

## Explanation

Comparing with last section, this only adding new content to outbounds and routing in configuration.

In routing section, two rules are added:

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

In the first rule, if the domain name contains tanx.com or baidu.com, the connection will be blocked. If you want to block certain websites, write the domain name you want to block in the adblock rules. In the second rule, domain names containing amazon.com or microsoft.com or youku.com or baidu.com will be directly connected. There is a problem, did you find that, both rules have baidu.com, so which one will be implemented? The answer is that only the first one (i.e. adblock) will be executed because:
1. rules are stored in routing.rules vector, which is in-order data structure, and the rule matching process would follow the order.
2. Therefore it would only apply the match that dispatcher first hits.

For more information, please refer [V2Ray Official Guide](https://v2fly.org/chapter_02/03_routing.html).

#### Updates

- 2018-11-09 Adapt to v4.0+ configuration format.
- 2019-11-03 Fix editing mistakes
