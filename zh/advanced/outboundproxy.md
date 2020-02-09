# 代理轉發

V2Ray 提供了代理轉發功能，利用它可以實現中轉（在沒有中轉服務器操作權限的情況下）。

## 基本代理轉發

使用代理轉發可以實現由一個 Shadowsocks 服務器或者 V2Ray(VMess) 服務器來中轉你的網絡流量，並且中轉服務器只能看到你加密的數據而不知道原始的數據是什麼。

以下面的配置說明，它的工作原理是：
1. 你在 Twitter 發了個帖子 f**k GFW，由 V2Ray 代理
2. V2Ray 客戶端收到瀏覽器發出的 f**k GFW 的帖子後，首先由對其進行加密(VMess，id: b12614c5-5ca4-4eba-a215-c61d642116ce,目的服務器: 1.1.1.1:8888)
3. 加密後數據包將被轉到 transit 這個 outbound 中，在這裏數據包又會加密一次(Shadowsocks, password: password, 服務器: 2.2.2.2:1024)
4. 兩次加密後的數據包被髮送到了 Shadowsocks 服務器，該服務器收到後解包後得到仍是加密的數據包（步驟 2 中加密後的數據包），然後將數據包發到 VMess 服務器。即便這個 Shadowsocks 服務器的主人是個偷窺狂魔，他也沒辦法看到你的原始數據。
5. VMess 服務器收到 Shadowsocks 服務器發來的數據包，解密得到原始的數據包，然後把你這個帖子發到 Twitter 的網站中。

只要第 5 步中的服務器是自己掌控的就不用擔心別人看到你的上網的內容。

客戶端：

```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { // settings 的根據實際情況修改
        "vnext": [
          {
            "address": "1.1.1.1",
            "port": 8888,
            "users": [
              {
                "alterId": 64,
                "id": "b12614c5-5ca4-4eba-a215-c61d642116ce"
              }
            ]
          }
        ]
      },
      "proxySettings": {
          "tag": "transit"  // 這裏的 tag 必須跟作爲代理 VPS 的 tag 一致，這裏設定的是 "transit"
        }
    },
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "2.2.2.2",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 1024
          }
        ]
      },
      "tag": "transit"
    }
  ]
}
```

## 鏈式代理轉發

如果你有多個 Shadowsocks 或 VMess 賬戶，那麼你可以這樣:

```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { // settings 的根據實際情況修改
        "vnext": [
          {
            "address": "1.1.1.1",
            "port": 8888,
            "users": [
              {
                "alterId": 64,
                "id": "b12614c5-5ca4-4eba-a215-c61d642116ce"
              }
            ]
          }
        ]
      },
      "tag": "DOUS",
      "proxySettings": {
          "tag": "DOSG"  
        }
    },
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "2.2.2.2",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 1024
          }
        ]
      },
      "tag": "AliHK"
    },
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "3.3.3.3",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 3442
          }
        ]
      },
      "tag": "AliSG",
      "proxySettings": {
          "tag": "AliHK"  
      }
    },
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "4.4.4.4",
            "port": 8462,
            "users": [
              {
                "alterId": 64,
                "id": "b27c24ab-2b5a-433e-902c-33f1168a7902"
              }
            ]
          }
        ]
      },
      "tag": "DOSG",
      "proxySettings": {
          "tag": "AliSG"  
      }
    },
  ]
}
```

那麼數據包經過的節點依次爲：
PC -> AliHK -> AliSG -> DOSG -> DOUS -> 目標網站

這樣的代理轉發形成了一條鏈條，我稱之爲鏈式代理轉發。

**注意：如果你打算配置(動態)鏈式代理轉發，應當明確幾點：**
* `性能`。鏈式代理使用了多個節點，可能會造成延時、帶寬等網絡性能問題，並且客戶端對每一個加解密的次數取決於代理鏈的長度，理論上也會有一定的影響。
* `安全`。前文提到，代理轉發會一定程度上提高安全性，但安全取決於最弱一環，並不意味着代理鏈越長就會越安全。如果你需要匿名，請考慮成熟的匿名方案。
另外，使用了代理轉發 streamSettings 會失效，即只能是非 TLS、無 HTTP 僞裝的 TCP 傳輸協議。

#### 更新歷史

- 2018-03-17 Update
- 2018-07-08 Update
- 2018-11-17 V4.0+ 配置
