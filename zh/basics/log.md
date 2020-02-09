# 日誌文件

使用一個軟件總是不可避免出現一些問題，比如說你用着某個軟件突然間崩潰了，興沖沖向開發者反饋說軟件有崩潰現象。開發者問你日誌，你沒有；問你詳細情況，你支支吾吾說不出來。比較和藹的開發者可能會跟你說：好的，我知道了，這個問題會解決的。內心獨白卻是：mdzz，啥也說不出來，日誌也沒有還瞎 bb。

對於軟件開發者來說使用查看日誌是一種非常有效的調試手段。普通用戶使用日誌可以知道軟件的運行狀況，並且當軟件出現異常時提供日誌給開發者可以令開發者更加容易找到問題的根源，加快修復問題。

## 配置

### 客戶端配置

```json
{
  "log": {
    "loglevel": "warning", // 日誌級別
    "access": "D:\\v2ray\\access.log",  // 這是 Windows 系統的路徑
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

### 服務器配置

```json
{
  "log": {
    "loglevel": "warning",
    "access": "/var/log/v2ray/access.log", // 這是 Linux 的路徑
    "error": "/var/log/v2ray/error.log"
  },
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

依次看 log 的選項：
* loglevel：日誌級別，分別有5個，本例中設定的是 warning
  - debug：最詳細的日誌信息，專用於軟件調試
  - info：比較詳細的日誌信息，可以看到 V2Ray 詳細的連接信息
  - warning：警告信息。輕微的問題信息，經我觀察 warning 級別的信息大多是網絡錯誤。推薦使用 warning
  - error：錯誤信息。比較嚴重的錯誤信息。當出現 error 時該問題足以影響 V2Ray 的正常運行
  - none：空。不記錄任何信息
* access：將訪問的記錄保存到文件中，這個選項的值是要保存到的文件的路徑
* error：將錯誤的記錄保存到文件中，這個選項的值是要保存到的文件的路徑
* error、access 字段留空，並且在手動執行 V2Ray 時，V2Ray 會將日誌輸出在 stdout 即命令行中（terminal、cmd 等），便於排錯

::: tip 提示
需要注意的一點是，在 json 中，反斜槓 `\` 有特殊意義，因此 Windows 操作系統目錄的 `\` 符號在配置中要使用 `\\` 來表示。
:::

------
#### 更新歷史

- 2018-09-03 Update
- 2018-11-09 跟進 v4.0+ 的配置格式
- 2019-07-12 使用新的 Markdown 容器，更改了一些文本。
