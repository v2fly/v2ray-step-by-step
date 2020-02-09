# 動態端口

V2Ray 提供了一個叫動態端口的功能。顧名思義，就是可以動態變化通信端口，該功能的初衷是爲了應對電信服務運營商可能會對長時間大流量的單個端口進行限速。也許是用的人比較少，到目前爲止沒有證據可以動態端口對於科學上網是加分項還是減分項。

## 注意

根據實際使用來看，動態端口功能是面向 vmess 協議的特性，其他協議似乎不支持該特性。

## 基本動態端口

服務器 inbound 的端口作爲主端口，在 inboundDetour 開動態監聽的端口，客戶端不用額外設定，客戶端會先與服務器的主端口通信協商下一個使用的端口號。

### 服務器配置

```json
{
  "inbounds":[
  { //主端口配置
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "alterId": 64
          }
        ],
        "detour": { //繞行配置，即指示客戶端使用 dynamicPort 的配置通信
          "to": "dynamicPort"
        }
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // 端口範圍
      "tag": "dynamicPort",  // 與上面的 detour to 相同
      "settings": {
        "default": {
          "alterId": 64
        }
      },
      "allocate": {            // 分配模式
        "strategy": "random",  // 隨機開啓
        "concurrency": 2,      // 同時開放兩個端口,這個值最大不能超過端口範圍的 1/3
        "refresh": 3           // 每三分鐘刷新一次
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

### 客戶端配置

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
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      }
    }
  ]
}
```

## 動態端口使用 mKCP

在對應的 inbounds 和 outbounds 加入 streamSettings 並將 network 設置爲 kcp 即可。

### 服務器配置

```json
{
  "inbounds": [
    {
      "port": 37192,
      "protocol": "vmess",
      "settings": {
        "clients": [
          {
            "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
            "level": 1,
            "alterId": 64
          }
        ],
        "detour": {
          "to": "dynamicPort"
        }
      },
      "streamSettings": {
        "network": "kcp"
      }
    },
    {
      "protocol": "vmess",
      "port": "10000-20000", // 端口範圍
      "tag": "dynamicPort",
      "settings": {
        "default": {
          "level": 1,
          "alterId": 32
        }
      },
      "allocate": {            // 分配模式
        "strategy": "random",  // 隨機開啓
        "concurrency": 2,      // 同時開放兩個端口
        "refresh": 3           // 每三分鐘刷新一次
      },
      "streamSettings": {
        "network": "kcp"
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

### 客戶端配置

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
            "address": "1.2.3.4",
            "port": 37192,
            "users": [
              {
                "id": "d17a1af7-efa5-42ca-b7e9-6a35282d737f",
                "alterId": 64
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "network": "kcp"
      }
    }
  ]
}
```
