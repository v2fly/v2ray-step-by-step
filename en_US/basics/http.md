# HTTP Outcoming
This section gives an example of the configuration of the HTTP (S) proxy. <br>
In the early V2Ray, HTTP (S) was not supported as an outbound protocol, but everyone's voices for HTTP (S) outbound support were relatively high. Therefore, HTTP (S) outbound feature is supported after V 4.21.1. <br>
The configuration is similar to VMess. The client and server must have an incoming and an outcoming protocol, but the protocol and its settings are different. You can refer to the following configurations:
## Configuration
### Client-side Configuration
```json
{
  "inbounds": [
    {
      "port": 1080, // Listening port
      "protocol": "socks", // Incoming protocol is SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  // No authorisation
      }
    }
  ],
  "outbounds": [
      {
        "protocol": "http",
        "settings": {
          "servers": [
            {
              "address": "192.168.108.1",// Server IP
              "port": 1024,// Server port
              "users": [
                {
                  "Username": "my-username",// Edit my-username to your username.
                  "Password": "my-password" // Edit my-password to your password.
                }
              ] 
            }
          ]
        },
        "streamSettings": {
          "security": "none", // If it is an HTTPS proxy, you need to edit none to tls
          "tlsSettings": {
            "allowInsecure": false
            // Check the validity of the certificate
        }
      }
    }
  ]
}
```

### Server-side Configuration

```json
{
  "inbounds": [
    {
      "port": 1024, // Listenning port 
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
## Notes
- The significance of the HTTP (S) outbound rule is that it is used for some local network user who requires an HTTP proxy to connect to the external internet. If you need to use the HTTP proxy to get over GFW, please read [Forward proxy](https://guide.v2fly.org/app/parent.html).
- The HTTP (S) outbound rule can be used as a configuration for external access, but the HTTP proxy protocol does not encrypt the transmission and is not suitable for transmission on the public network. Also, because it does not support UDP transmission, the V2Ray core features will be limited (e.g. DNS queries are not available).