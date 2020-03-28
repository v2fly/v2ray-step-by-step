# 前置代理
前置代理可以在需要 http 代理才能联网的场景下用到,本质上前置代理是[代理转发](https://guide.v2fly.org/advanced/outboundproxy.html)的一种,只需要修改客户端配置即可.
## 基本配置 (V2ray 4.21.0+)
使用前置代理可以实现先通过 HTTP 代理联网,然后再使用 V2Ray(VMESS)的效果.并且 HTTP 代理服务器只能看见你加密的流量,并不能看到你在访问什么.
### 客户端
```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { // settings 的根据实际情况修改
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
            "address": "192.168.108.1",//服务器IP
            "port": 3128,//服务器端口
            "users": [
              {
                "user": "my-username",//将my-username改为你的用户名.
                "pass": "my-password" //将my-password改为你的密码
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
## HTTPS 的前置代理配置 (V2ray 4.21.1+)
如果需要 HTTPS 代理为出口的话需要这样写
```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { // settings 的根据实际情况修改
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
            "address": "192.168.108.1",//服务器IP
            "port": 3128,//服务器端口
            "users": [
              {
                "user": "my-username",//将my-username改为你的用户名.
                "pass": "my-password" //将my-password改为你的密码
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": false
          //是否检测证书有效性,在自定义证书的情况开可以开启(false改为true)这个
        }
      },
      "tag": "HTTP"
    }
  ]
}
```
**注意:使用 HTTP 为前置代理时,因为 HTTP 协议的特性无法代理 UDP 包,所以[底层传输协议](https://www.v2fly.org/chapter_02/05_transport.html)不要选择 KCP,QUIC 之类以 UDP 传输的协议**