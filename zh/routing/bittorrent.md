# 禁用 BT

國外版權意識比較重，如果下載盜版的影音文件很有可能會吃官司，所以大多數國外的 VPS 的使用條例都不允許下載 BT。但是一些人並不清楚這點，經常使用朋友分享給他的翻牆賬號進行 BT 下載最終導致 VPS 被提供商封禁。儘管有時候說了不能使用代理下載 BT，對方也表示明白了清楚了，但總是有軟件喜歡設置系統代理，也總有軟件喜歡使用系統代理，好像也有不少人把路由器翻牆當成了不可或缺的，最終還是逃不了封禁的厄運。這個問題似乎從進入到 VPS 翻牆時代就困擾這大家，於是各種禁止 BT 的一鍵腳本也隨之應運而生，也時常有人在討論哪個腳本比較好用，其實最根本的幾乎全是 IPTABLES 的字符串匹配。

在 V2Ray,修改配置文件的路由配置即可禁用 BT。不過，你要說用那些一鍵腳本比配置 V2Ray 更簡單。嗯，你說得挺對的，很有道理。單從禁用 BT 來說的話，也許IPTABLES 的方式會好一些，也可能不是。但是別忘了，V2Ray 的路由功能可不是隻能禁止連接而已，本質應該是轉發。也就是說，如果你有一臺無視版權的 VPS，那麼大可將 BT 流量轉到這臺 VPS 上。
 
 
## 服務器配置

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

`注意`: inbound 的 sniffing 必須開啓。

## 客戶端配置

#### 更新歷史

- 2018-08-07 初版
- 2019-01-13 v4.0+ 配置格式
