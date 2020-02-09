# 前置代理
前置代理可以在需要http代理才能聯網的場景下用到,本質上前置代理是[代理轉發](https://guide.v2fly.org/advanced/outboundproxy.html)的一種,只需要修改客戶端配置即可.
## 基本配置 (V2ray 4.21.0+)
使用前置代理可以實現先通過HTTP代理聯網,然後再使用V2Ray(VMESS)的效果.並且HTTP代理服務器只能看見你加密的流量,並不能看到你在訪問什麼.
### 客戶端
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
      "tag": "VMESS",
      "proxySettings": {
          "tag": "HTTP"  
        }
    },
    {
      "protocol": "http",
      "settings": {
        "servers": [
          {
            "address": "192.168.108.1",//服務器IP
            "port": 3128,//服務器端口
            "users": [
              {
                "user": "my-username",//將my-username改爲你的用戶名.
                "pass": "my-password" //將my-password改爲你的密碼
              }
            ]
          }
        ]
      },
      "tag": "HTTP"
    }
  ]
}

```
## HTTPS的前置代理配置 (V2ray 4.21.1+)
如果需要HTTPS代理爲出口的話需要這樣寫
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
      "tag": "VMESS",
      "proxySettings": {
          "tag": "HTTP"  
        }
    },
    {
      "protocol": "http",
      "settings": {
        "servers": [
          {
            "address": "192.168.108.1",//服務器IP
            "port": 3128,//服務器端口
            "users": [
              {
                "user": "my-username",//將my-username改爲你的用戶名.
                "pass": "my-password" //將my-password改爲你的密碼
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": false
          //是否檢測證書有效性,在自定義證書的情況開可以開啓(false改爲true)這個
        }
      },
      "tag": "HTTP"
    }
  ]
}
```
**注意:使用HTTP爲前置代理時,因爲HTTP協議的特性無法代理UDP包,所以[底層傳輸協議](https://www.v2fly.org/chapter_02/05_transport.html)不要選擇KCP,QUIC之類以UDP傳輸的協議**