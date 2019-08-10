# Restricting BitTorrent

Some countries have strict copyright protection. As downloading pirated audio and video files are likely to receive warnings, most VPS service providers do not allow BT downloading. However, some people are not aware of this. They often use the proxy shared by friends to do BT downloads, which eventually causes a VPS suspension. Even though sometimes we told friends that they can't use BT downloading client, some people like set V2Ray client as a system global proxy, so BT clients' traffic will also go through the proxy. This problem seems to have troubled many people from deploy proxy server on VPS, so all kinds of one-click shell scripts that prohibit BT have also emerged. It is also often discussed which script is easier to use. Many of them are based on the string matching of IPTABLES. 

Actually, you can edit the configuration file to prohibit the BT protocol. If disabling BT traffic is your only need, maybe the IPTABLES method is better. But don't forget, V2Ray's routing feature doesn't not only prohibit the connection, but also relays your traffic. Then you can set bypass proxy to some VPSs they don't care about copyright, and use BT download as you want.


## Server-side Configuration

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log",
    "error": "/var/log/v2ray/error.log"
  },
  "inbounds": [
    {
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
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
    },
    {
      "protocol": "blackhole",
      "settings": {},
      "tag": "block"
    }
  ],
  "routing": {
    "domainStrategy": "AsIs",
    "rules": [
      {
        "type": "field",
        "outboundTag": "block",
        "protocol": [
          "bittorrent"
        ]
      }
    ]
  }
}
```

Attention: `sniffing` must be turned on in the inbound options.

## Client-side Configuration

#### Updates

- 2018-08-07 Initial Version
- 2019-01-13 v4.0+ Adaptation
