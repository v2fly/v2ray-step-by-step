# Shadowsocks

本節講述 Shadowsocks 的配置。

其實，作爲一個代理工具集合，V2Ray 集成有 Shadowsocks 模塊。用 V2Ray 配置成 Shadowsocks 服務器或者 Shadowsocks 客戶端都是可以的，兼容 Shadowsocks-libev, go-shadowsocks2 等基於 Shadowsocks 協議的客戶端。

配置與 VMess 大同小異，客戶端服務器端都要有入口和出口，只不過是協議（protocol）和相關設置（settings）不同，不作過多說明，直接給配置，如果你配置過 Shadowsocks，對比之下就能夠明白每個參數的意思（配置還有註釋說明呢）。

## 配置

### 客戶端配置

```json
{
  "inbounds": [
    {
      "port": 1080, // 監聽端口
      "protocol": "socks", // 入口協議爲 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  // 不認證
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "serveraddr.com", // Shadowsocks 的服務器地址
            "method": "aes-128-gcm", // Shadowsocks 的加密方式
            "ota": true, // 是否開啓 OTA，true 爲開啓
            "password": "sspasswd", // Shadowsocks 的密碼
            "port": 1024  
          }
        ]
      }
    }
  ]
}
```

### 服務器配置

```json
{
  "inbounds": [
    {
      "port": 1024, // 監聽端口
      "protocol": "shadowsocks",
      "settings": {
        "method": "aes-128-gcm",
        "ota": true, // 是否開啓 OTA
        "password": "sspasswd"
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

## 注意事項

- 因爲協議漏洞，Shadowsocks 已放棄 OTA（一次認證）轉而使用 AEAD，V2Ray 的 Shadowsocks 協議已經跟進 AEAD，但是仍然兼容 OTA。建議使用 AEAD（method 爲 aes-256-gcm、aes-128-gcm、chacha20-poly1305 即可開啓 AEAD）, 使用 AEAD 時 OTA 會失效；
- Shadowsocks 已經棄用 simple-obfs，可使用基於 V2Ray 的新版混淆插件（但也可以使用 V2Ray 的 Websocket/http2 + TLS）；
- 可以使用 V2Ray 的傳輸層配置（詳見[高級篇](/advanced/advanced.md)），~~但如果這麼設置了將與原版 Shadowsocks 不兼容~~（兼容 Shadowsocks 新增的 [v2ray-plugin](https://github.com/shadowsocks/v2ray-plugin)插件)。

---

#### 更新歷史

- 2018-02-09 AEAD 更新
- 2018-09-03 描述更新
- 2018-11-09 跟進 v4.0+ 的配置格式
- 2019-01-19 v2ray-plugin 
