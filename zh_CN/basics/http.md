# HTTP
本节举例HTTP(S)代理的配置.<br>
在早期的V2Ray中不支持HTTP(S)作为出站协议的,但大家对HTTP(S)出站支持的呼声比较高,于是在最近的版本(V4.21.1)中推出了HTTP(S)出站的支持.<br>
配置与 VMess 大同小异，客户端服务器端都要有入口和出口，只不过是协议(protocol)和相关设置(settings)不同，不作过多说明，直接给配置.
## 配置
### 客户端配置
```json
{
  "inbounds": [
    {
      "port": 1080, // 监听端口
      "protocol": "socks", // 入口协议为 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  // 不认证
      }
    }
  ],
  "outbounds": [
      {
        "protocol": "http",
        "settings": {
          "servers": [
            {
              "address": "192.168.108.1",//服务器IP
              "port": 1024,//服务器端口
              "users": [
                {
                  "Username": "my-username",//将my-username改为你的用户名.
                  "Password": "my-password" //将my-password改为你的密码
                }
              ] 
            }
          ]
        },
        "streamSettings": {
          "security": "none", //如果是HTTPS代理,需要將none改為tls
          "tlsSettings": {
            "allowInsecure": false
            //检测证书有效性
        }
      }
    }
  ]
}
```

### 服务器配置

```json
{
  "inbounds": [
    {
      "port": 1024, // 监听端口
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
## 注意事项
- HTTP(S)代理并不是为了对抗墙而设计,所以不建议使用HTTP代理翻墙.
- HTTP(S)代理存在的意义是方便企业或学校的用户联网使用,如果需要在使用HTTP代理联网的前提下翻墙请阅读[前置代理](https://guide.v2fly.org/app/parent.html).