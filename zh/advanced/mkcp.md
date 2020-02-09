# mKCP

V2Ray 引入了 [KCP](https://github.com/skywind3000/kcp) 傳輸協議，並且做了一些不同的優化，稱爲 mKCP。如果你發現你的網絡環境丟包嚴重，可以考慮一下使用 mKCP。由於快速重傳的機制，相對於常規的 TCP 來說，mKCP 在高丟包率的網絡下具有更大的優勢，也正是因爲此， mKCP 明顯會比 TCP 耗費更多的流量，所以請酌情使用。要了解的一點是，mKCP 與 KCPTUN 同樣是 KCP 協議，但兩者並不兼容。

在此我想糾正一個概念。基本上只要提起 KCP 或者 UDP，大家總會說”容易被 Qos“。Qos 是一個名詞性的短語，中文意爲服務質量，試想一下，你跟人家說一句”我的網絡又被服務質量了“是什麼感覺。其次，哪怕名詞可以動詞化，這麼使用也是不合適的，因爲 Qos 區分網絡流量優先級的，就像馬路上劃分人行道、非機動車道、快車道、慢車道一樣，哪怕你牛逼到運營商送你一條甚至十條專線，是快車道中的快車道，這也是 Qos 的結果。


## 配置

mKCP 的配置比較簡單，只需在服務器的 inbounds 和 客戶端的 outbounds 添加一個 streamSettings 並設置成 mkcp 即可。

### 服務器配置

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
        "network": "mkcp", //此處的 mkcp 也可寫成 kcp，兩種寫法是起同樣的效果
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

### 說明

在上面的配置當中，與之前相比主要的變化在於多了一個 streamSettings，包含有不少參數：
* `network`: 網絡的選擇，要像上面的配置寫成 kcp 或 mkcp 纔會啓用 mKCP
* `kcpSettings`: 包含一些關於 mKCP 設置的參數，有
  * `uplinkCapacity`: 上行鏈路容量，將決定 V2Ray 向外發送數據包的速率。單位爲 MB
  * `downlinkCapacity`：下行鏈路容量，將決定 V2Ray 接收數據包的速率。單位同樣是 MB
  * `header`：對於數據包的僞裝
    * `type`：要僞裝成的數據包類型

客戶端的上行對於服務器來說是下行，同樣地客戶端的下行是服務器的上行，mKCP 設置當中服務器和客戶端都有 uplinkCapacity 和 downlinkCapacity，所以客戶端的上傳速率由服務器的 downlinkCapacity 和客戶端的 uplinkCapacity 中的最小值決定，客戶端的下載速率也是同樣的道理。因此，建議將服務器和客戶端的 downlinkCapacity 設成一個很大的值，然後分別修改兩端的 uplinkCapacity 以調整上下行速率。

還有一個 header 參數可以對 mKCP 進行僞裝，這是 mKCP 的一個優勢。具體的僞裝類型在 type 參數設置，type 可以設置成 utp、srtp、wechat-video、dtls、wireguard 或者 none，這幾個分別將 mKCP 數據僞裝成 BT 下載、視頻通話、微信視頻通話、dtls、wireguard(一種新型 VPN)以及不進行僞裝。**這裏的 type 參數，客戶端與服務器要一致。還有要時刻記住僞裝僅僅是僞裝。**

至於上述配置裏有但是我沒有說明的參數，是 V2Ray 的默認值，我個人建議是保持默認。如果你需要了解或者修改，請參考手冊。

#### 更新歷史

- 2018-03-17 Update
- 2018-08-30 Update
- 2018-11-17 V4.0+ 配置

