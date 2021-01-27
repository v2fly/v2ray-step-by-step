# Chinese Websites Direct Connection

## Configuration Example

### Client-side

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
      "tag": "direct" // it is a must if you want to use V2Ray's routing feature. here direct is a tag of this freedom outbound, then V2Ray will know this outbound stands for "direct".
    }    
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"] // Mainstream Chinese websites
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn", // China IP addresses
          "geoip:private" // Private IP, like internal addresses.
        ]
      }
    ]
  }
}
```

### Server-side

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

## Explanation

Looking at the client configuration, notice that routing has a `domainStrategy`, here we will not explain it, but you can refer to the manual. Let's focus on `rules`, note that it is an array, which means that you can set multiple routing rules. When you visit a website, the packet will enter the V2Ray inbound, and the route will check if there is any match the rules and then follow the rules.

Each rule in the rules array is surrounded by a set of braces `{ }`. The type in the rules is fixed (that is, just copy it). The two rules are `"domain": ["geosite:cn"]` and `"ip": ["geoip:cn"]`, these two rules It contains most of the domain names and almost all IPs of mainstream websites in mainland China. The outboundTag of the two rules is direct (the tag of direct in outbounds is freedom), so if you visit a domestic website route, the packet will be sent to freedom, which is a direct connection. For example, if I visited qq.com, qq.com is a domestic website included in chinasites, it will match the routing rules and send it to freedom.

You may get confused from the above example, as the routing rules are only directly connected to the Chinese website. There are no rules about the proxy, but you can still access many walled websites such as google.com and twitter.com. This is because the first outcoming protocol in `outbounds` is the default outcoming. When a packet has no matching rules, the route will send the packet to the default outcome. In this case, as VMess protocol is the first outbound, so for the packet's destination, if is not matched from Chinese websites list, it will be forwarded to the VPS proxy via this VMess outbound.
<!-- ``-->

The server configuration is the same as the previous VMess config and will not repeat again.

-----
The configuration up to here has been able to meet the basic needs of internet censorship circumvention. But V2Ray has many features, so there are still more applications will be introduced in the following chapters. That's why we said the V2Ray is a feature-rich proxy platform at the beginning.

As there are many powerful features waiting for us to dig, so we suggest you read the following chapters in this guide.

#### Updates

- 2018-11-09 Adapt to v4.0+ configuration format.
