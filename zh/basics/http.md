# HTTP
本節舉例HTTP(S)代理的配置.<br>
在早期的V2Ray中不支持HTTP(S)作爲出站協議的,但大家對HTTP(S)出站支持的呼聲比較高,於是在最近的版本(V4.21.1)中推出了HTTP(S)出站的支持.<br>
配置與 VMess 大同小異，客戶端服務器端都要有入口和出口，只不過是協議(protocol)和相關設置(settings)不同，不作過多說明，直接給配置.
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
        "protocol": "http",
        "settings": {
          "servers": [
            {
              "address": "192.168.108.1",//服務器IP
              "port": 1024,//服務器端口
              "users": [
                {
                  "Username": "my-username",//將my-username改爲你的用戶名.
                  "Password": "my-password" //將my-password改爲你的密碼
                }
              ] 
            }
          ]
        },
        "streamSettings": {
          "security": "none", //如果是HTTPS代理,需要將none改為tls
          "tlsSettings": {
            "allowInsecure": false
            //檢測證書有效性
        }
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
      "protocol": "http",
      "settings": {
        "timeout:":0,
        "accounts":[
          {
            "user":"my-username",
            "pass":"my-password"
          }
        ],
        "allowTransparent":false,
        "userLevel":0
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
- HTTP(S) 出站規則存在的意義是方便只能使用http proxy對外訪問內部網絡中用戶聯網使用,如果需要在使用HTTP代理聯網的前提下翻牆請閱讀[前置代理](https://guide.v2fly.org/app/parent.html).
- HTTP(S) 出站規則可以作爲對外訪問的配置，但http proxy協議沒有對傳輸加密，不適宜經公網中傳輸，且因不支持udp傳輸將會導致core功能受限(Routing過程的的DNS查詢不可用).