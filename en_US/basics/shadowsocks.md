# Shadowsocks

In this section, we will give the instructions about configuring Shadowsocks protocol with V2Ray

As a proxy protocol toolbox, V2Ray supports the Shadowsocks protocol. V2Ray can be configured as either a Shadowsocks server or a client. The implementation of Shadowsocks in V2Ray is compatible with Shadowsocks-libev, Go-shadowsocks2 and other clients based on the Shadowsocks protocol.

The configuration is similar to VMess. The client-server must have an incoming and outgoing configuration. The difference is that we use Shadowsocks protocol and its parameters. Therefore we directly give the example configuration. If you have configured Shadowsocks-libev before, compare with it, and you will able to understand the example in this section.

## Configuration

### Client-side Configuration

```json
{
  "inbounds": [
    {
      "port": 1080, // Listening port
      "protocol": "socks", // Incoming protocol is Socks5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"  // No authrisation of Socks5
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "serveraddr.com", // Server address of Shadowsocks 
            "method": "aes-128-gcm", // Encryption method of Shadowsocks 
            "ota": false, // Whether enable OTA, default is false, we don't recommand enable this as decrepted by Shadowsocks
            "password": "sspasswd", // Password of Shadowsocks 
            "port": 1024  
          }
        ]
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
      "port": 1024, // Listening port 
      "protocol": "shadowsocks",
      "settings": {
        "method": "aes-128-gcm",
        "ota": true, // Whether enable OTA or not
        "password": "sspasswd" // Password of Shadowsocks
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

- Because of the protocol bug, OTA (one-time authentication) of Shadowsocks has been deprecated and switched to AEAD (authenticated encryption with associated data). V2Ray's Shadowsocks protocol has been followed by AEAD, but it is still compatible with OTA. It is recommended to use AEAD ciphers (cipher could be aes-256-gcm, aes-128-gcm, chacha20-poly1305 for enabling AEAD), OTA will be invalid when enabling AEAD;
- The simple-obfs plugin of Shadowsocks has been deprecated and you can use the new V2Ray-based obfuscation plugin (but V2Ray's Websocket/http2 + TLS also works);
- You can use V2Ray's transport layer configuration (see [Advanced](/advanced/README.md)), it is compatible with Shadowsocks' new [v2ray based plugin](https://github.com/shadowsocks/v2ray-plugin).
<!-- ~~ ~~-->

---

#### Updates

- 2018-02-09 Update for AEAD cipher
- 2018-09-03 Update of description
- 2018-11-09 Adapt to v4.0+ configuration format.
- 2019-01-19 Update the information of v2ray-plugin of Shadowsocks
