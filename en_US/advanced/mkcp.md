# mKCP

V2Ray introduced the [KCP](https://github.com/skywind3000/kcp) transport protocol and made some different optimisations called modified KCP (mKCP). If you find that your network environment has heavily packet losing, consider using mKCP. Due to the fast retransmission mechanism, mKCP has a greater advantage than the conventional TCP in a network with a high packet loss environment. Because of this, mKCP have more traffic consumption than TCP, so please using it carefully. One thing to understand is that mKCP is the same KCP protocol as KCPTUN, but the two are not compatible.

I want to correct a concept here. As long as you mention KCP or UDP, you will always say "easy to be QoS", but QoS is a noun phrase. It is a shortcut to Quality of service. Imagine that you said something to me, "my network is being serviced again." Secondly, even if the noun can be verbized, it is not suitable for use. Because QoS distinguishes the priority of network traffic, it is like dividing the sidewalk, non-motor vehicle lane, fast lane and the slow lane on the road, even if you have the highest priority of internet service, which is the fast lane in the fast lane. This is also the result of QoS.


## Configuration Example

The configuration of mKCP is relatively simple. Just add a streamSettings to the inbounds of the server and the outbounds of the client and set it to mkcp.

### Server-side Configuration

```json
{
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
      },
      "streamSettings": {
        "network": "mkcp", // Alternatively, you can write kcp, they are the same
        "kcpSettings": {
          "uplinkCapacity": 5,
          "downlinkCapacity": 100,
          "congestion": true,
          "header": {
            "type": "none"
          }
        }
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

### Client-side Configuration

```json
{
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
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "mkcp",
        "kcpSettings": {
          "uplinkCapacity": 5,
          "downlinkCapacity": 100,
          "congestion": true,
          "header": {
            "type": "none"
          }
        }
      }
    }
  ]
}
```

### Explanation

In the above configuration, the main change compared to before is that there is one more streamSettings, which contains many parameters:
* `network`: The choice of network, like the above configuration written as kcp or mkcp will enable mKCP
* `kcpSettings`: contains some parameters about mKCP settings, there are
  * `uplinkCapacity`: The uplink capacity, which determines the rate at which V2Ray sends out packets. The unit is megabytes (MB)
  * `downlinkCapacity`: The downlink capacity that will determine the rate at which V2Ray receives packets. The unit is also MB
  * `header`：Obfuscation of packets
    * `type`：Type of obfuscation

The client's uplink is downlink for the server. Similarly, the client's downlink is the server's uplink. In the mKCP setting, both the server and the client have uplinkCapacity and downlinkCapacity, so the client's upload rate is determined by the server's downlinkCapacity and the client's uplinkCapacity. It is decided that the download rate of the client is the same. Therefore, it is recommended to set the downlinkCapacity of the server and client to a large value, and then modify the uplinkCapacity of both ends to adjust the uplink and downlink rates.

There is also a header parameter that can camouflage mKCP, which is an advantage of mKCP. The specific masquerading type is set in the type parameter, type can be set to utp, srtp, wechat-video, dtls, wireguard or none, which respectively disguise the mKCP data into BT download, video call, WeChat video call, dtls, wireguard ( A new type of VPN) and no camouflage. **The type parameter here is the same as the client and server. Also remember to always remember that camouflage is just a disguise. **

As for the parameters in the above configuration but I have not explained, it is the default value of V2Ray. My personal recommendation is to keep the default. If you need to understand or modify, please refer to the manual.

#### Updates

- 2018-03-17 Update
- 2018-08-30 Update
- 2018-11-17 Adapted for V4.0+

