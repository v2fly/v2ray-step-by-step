# QUIC

V2Ray 自 4.7 版本起支持 QUIC。QUIC 全称 Quick UDP Internet Connection，是由 Google 提出的使用 UDP 进行多路并发传输的协议。其主要优势是:

1. 减少了握手的延迟（1-RTT 或 0-RTT）
2. 多路复用，并且没有 TCP 的阻塞问题
3. 连接迁移，（主要是在客户端）当由 Wifi 转移到 4G 时，连接不会被断开。

## 配置

### 服务器配置

```json
{
  "inbounds": [
    {
      "port": 3333,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "5557d3ef-ecda-45b1-9ead-f1f464ccb9b0",
            "alterId": 4
          }
        ]
      },
      "streamSettings": {
        "network": "quic",
        "security": "none",
        "quicSettings": {
          "security": "aes-128-gcm",
          "key": "sthyoulike",
          "header": {
            "type": "wechat-video"
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

### 客户端配置

```json
{
  "inbounds": [
    {
      "port": 1080,
      "listen": "127.0.0.1",
      "protocol": "socks",
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth",
        "udp": false
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "your_ip_address",
            "port": 3333,
            "users": [
              {
                "id": "5557d3ef-ecda-45b1-9ead-f1f464ccb9b0",
                "alterId": 4
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "quic",
        "security": "none",
        "quicSettings": {
          "security": "aes-128-gcm",
          "key": "sthyoulike",
          "header": {
            "type": "wechat-video"
          }
        }
      }
    }
  ]
}
```

### 说明

以下是 streamSettings 里一些需要说明的参数：

* `network`: 网络的选择，写为 quic 以启用 QUIC
* `quicSettings`: 包含一些关于 quic 设置的参数，有
  * `security`: 数据包的加密方式
  * `key`: 加密时所用的密钥
  * `header`：对于数据包的伪装
    * `type`：要伪装成的数据包类型

与 mKCP 相同的点是，QUIC 可以对数据包进行伪装。可以将 type 设置成 utp、srtp、wechat-video、dtls、wireguard 或者 none，这几个分别将 QUIC 数据伪装成 BT 下载、视频通话、微信视频通话、dtls、wireguard (一种新型 VPN) 以及不进行伪装。

与 mKCP 不同之处在于，QUIC 多了一个 security 和 key。security 可以选择一种方式对 QUIC 数据包进行加密，默认值为 none (不加密)，可选值为 aes-128-gcm 和 chacha20-poly1305。key 是加密时所用的密钥，可以是你喜欢的任意字符串。但是要注意，只有当 security 不为 none 时，key 才会生效。

当加密和伪装都不启用时，数据包即为原始的 QUIC 数据包，可以与其它的 QUIC 工具对接。为了避免被探测，建议加密或伪装至少开启一项。

你会发现 quicSettings 之外的 streamSettings 里也有一个 security，这里只需要设置为 none 就可以了。由于 QUIC 强制开启 TLS，在传输配置中没有开启 TLS 时，V2Ray 会自行签发一个证书进行 TLS 通讯。因此在使用 QUIC 传输时，可以关闭 VMess 的加密。

#### 更新历史

- 2020-06-28 初版
