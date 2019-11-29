# Forward Proxy
The forward proxy can be used in scenarios where an HTTP proxy is required to connect to the internet. Actually, the forward proxy is a type of [proxy forwarding](https://guide.v2fly.org/advanced/outboundproxy.html), which only needs to modify the client-side configuration.
## Basic configuration (V2ray 4.21.0+)
Using a forward proxy can achieve the effect of networking through HTTP proxy first, and then using V2Ray (VMESS). Moreover, the HTTP proxy server can only see your encrypted traffic and cannot see what you are actually accessing.
### Client-side configuraion
```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { //  settings need to be edited according to the actual situation
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
            "address": "192.168.108.1",// server IP
            "port": 3128,// server port
            "users": [
              {
                 "user": "my-username", // edit my-username to your username
                 "pass": "my-password" // edit my-password to your password
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
## HTTPS forward proxy configuration (V2ray 4.21.1+)
If you need HTTPS proxy as a forward proxy, you need to configure like this
```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { //  settings are modified according to the actual situation
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
            "address": "192.168.108.1",// Server IP
            "port": 3128,// Server port
            "users": [
              {
                "user": "my-username",// edit my-username to your username.
                "pass": "my-password" //edit my-password to your password.
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "security": "tls",
        "tlsSettings": {
          "allowInsecure": false
          // Whether to check the validity of the certificate. It can be turned on in the case of a custom certificate (false to true).
        }
      },
      "tag": "HTTP"
    }
  ]
}
```
**Note: When using HTTP as a forward proxy, because the characteristics of the HTTP protocol cannot proxy UDP packets, [underlying transport protocol](https://www.v2fly.org/chapter_02/05_transport.html). Do not choose KCP, QUIC protocols, as they use UDP transmission**