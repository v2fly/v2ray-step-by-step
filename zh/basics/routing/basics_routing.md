# 路由功能

本小節將介紹路由功能的使用。V2Ray 的一大特點就是內置了路由功能，用大白話說就是可以根據自己的實際情況制定一些規則來滿足自己的上網需求，最簡單最常見的就是直連國內網站、攔截特定站點以及代理被牆網站。

## 路由簡介

先簡單舉幾個例子，都是客戶端的。

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
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  
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

像上面這個配置就是前面 VMess 的客戶端配置文件，假如改一下 outbound 的內容，變成這樣：

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
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom", //原來是 VMess，現在改成 freedom
      "settings": {
      }
    }
  ]
}
```

如果修改成這個配置重啓客戶端之後，你會發現這個時候瀏覽器設不設置代理其實是一樣的，像 Google 這類被牆的網站沒法訪問了，taobao 這種國內網站還是跟平常一樣能上。如果是前面的介紹 VMess，數據包的流向是:
```
{瀏覽器} <--(socks)--> {V2Ray 客戶端 inbound <-> V2Ray 客戶端 outbound} <--(VMess)-->  {V2Ray 服務器 inbound <-> V2Ray 服務器 outbound} <--(Freedom)--> {目標網站}
```
但因爲現在 V2Ray 客戶端的 outbound 設成了 freedom，freedom 就是直連，所以呢修改後數據包流向變成了這樣：
```
{瀏覽器} <--(socks)--> {V2Ray 客戶端 inbound <-> V2Ray 客戶端 outbound} <--(Freedom)--> {目標網站}
```
V2Ray 客戶端從 inbound 接收到數據之後沒有經過 VPS 中轉，而是直接由 freedom 發出去了，所以效果跟直接訪問一個網站是一樣的。

再來看下面這個:

```json
{
  "log":{
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "blackhole",
      "settings": {
      }
    }
  ]
}
```

這樣的配置生效之後，你會發現無論什麼網站都無法訪問。這是爲什麼呢？blackhole 是黑洞的意思，在 V2Ray 這裏也差不多相當於是一個黑洞，就是說 V2Ray 從 inbound 接收到數據之後發到 outbound，因爲 outbound 是 blackhole，來什麼吞掉什麼，就是不轉發到服務器或者目標網站，相當於要訪問什麼就阻止訪問什麼。

到這兒爲止，總共介紹了 4 種出口協議：用於代理的 VMess 和 Shadowsocks 協議，用於直連的 freedom 協議，以及用於阻止連接的 blackhole 協議。我們可以利用這幾種協議再配合路由功能可以靈活地根據自己的需求針對不同網站進行代理、直連或者攔截。舉個簡單的例子，比較大衆的需求是被牆網站走代理，國內網站直連，其他一些不喜歡的則攔截(比如說百度的高精度定位)。

等等！你這裏有 VMess、freedom 和 blackhole 3 個出口，難道要運行 3 個 V2Ray 嗎？

當然不是！在 V2Ray 的配置中，`outbounds` 是出口協議的集合，你可以在裏面放任意多個出口協議，不僅 3 個，300 個都可以。下面給出放 3 個出口協議配置的例子。

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
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [ 
    {
      "protocol": "vmess", // 出口協議
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // 服務器 IP 地址
            "port": 16823,  // 服務器端口
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // 用戶 ID，須與服務器端配置相同
                "alterId": 64
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "settings": {}
    }
  ]
}
```

當然這個配置只是包含了多個出口協議而已，在包含多個出口協議的情況下，只會以 outbounds 中的第一個出口作爲默認的出口。要達到上面說的被牆網站走代理，國內網站直連，其他特殊網站攔截的效果，還得加入路由功能的配置。關於路由功能的配置見後面兩小節。

#### 更新歷史

- 2018-11-09 跟進 v4.0+ 的配置格式
