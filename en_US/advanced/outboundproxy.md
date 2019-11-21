# Proxy Forwarding

V2Ray provides a proxy forwarding feature that allows it behaves a preposed proxy (without server-side configuration).

## Basic proxy forwarding.

Using proxy forwarding allows you to relay your network traffic from a Shadowsocks server or a V2Ray (VMess) server, and the intermediate transit server can only see your encrypted data without sniffing what the original data is.

In the following configuration, it works like:
1. You tweeted on Twitter said f**k GFW, proxied by V2Ray
2. After receiving the f**k GFW post from the browser, the V2Ray client first encrypts it (VMess, id: b12614c5-5ca4-4eba-a215-c61d642116ce, destination server: 1.1.1.1:8888)
3. After the encryption, the packet will be transferred to the outbound of the transit, where the packet will be encrypted again (Shadowsocks, password: password, Server: 2.2.2.2:1024)
4. The twice encrypted packet is sent to the Shadowsocks server, which receives the unpacked packet and obtains the encrypted packet (the encrypted packet in step 2), and then sends the packet to the VMess server. Even if the owner of this Shadowsocks server is a voyeur, he can't see your raw data.
5. The VMess server receives the packet from the Shadowsocks server, decrypts the original packet, and sends your post to Twitter's website.

As long as the server in step 5 is under your control, you don't have to worry about what others see on your Internet.

Client-side

```json
{
"outbounds": [
{
"protocol": "vmess",
"settings": { // settings are modified according to the actual situation
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
"proxySettings": {
"tag": "transit" // The tag here must match the tag as the proxy VPS. The "transit" is set here.
}
},
{
"protocol": "shadowsocks",
"settings": {
"servers": [
{
"address": "2.2.2.2",
"method": "aes-256-cfb",
"ota": false,
"password": "password",
"port": 1024
}
]
},
"tag": "transit"
}
]
}
```

## Chain proxy forwarding

If you have multiple Shadowsocks or VMess accounts, then you can do this:

```json
{
  "outbounds": [
    {
      "protocol": "vmess",
      "settings": { // Editing this for your network envirionment
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
      "tag": "DOUS",
      "proxySettings": {
          "tag": "DOSG"  
        }
    },
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "2.2.2.2",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 1024
          }
        ]
      },
      "tag": "AliHK"
    },
    {
      "protocol": "shadowsocks",
      "settings": {
        "servers": [
          {
            "address": "3.3.3.3",
            "method": "aes-256-cfb",
            "ota": false,
            "password": "password",
            "port": 3442
          }
        ]
      },
      "tag": "AliSG",
      "proxySettings": {
          "tag": "AliHK"  
      }
    },
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "4.4.4.4",
            "port": 8462,
            "users": [
              {
                "alterId": 64,
                "id": "b27c24ab-2b5a-433e-902c-33f1168a7902"
              }
            ]
          }
        ]
      },
      "tag": "DOSG",
      "proxySettings": {
          "tag": "AliSG"  
      }
    },
  ]
}
```

Then the nodes through which the packet passes are:
PC -> AliHK -> AliSG -> DOSG -> DOUS -> Destined Website

Such proxy forwarding forms a chain, which I call chained proxy forwarding.

**Note: If you plan to configure (dynamic) chained proxy forwarding, you should be clear about the following: **
* `Performance`. The chained proxy uses multiple nodes, which may cause network performance problems such as delay and bandwidth. The number of times the client encrypts and decrypts each depends on the length of the proxy chain, and theoretically, it will have a certain impact.
* `Security`. As mentioned earlier, proxy forwarding will improve security to a certain extent, but security depends on the weakest link. It does not mean that the longer the proxy chain, the more secure it will be. If you need to be anonymous, consider a mature anonymous solution.
In addition, the use of proxy forwarding streamSettings will be invalid, that is, only non-TLS, no HTTP obfuscation, standard TCP transport protocol. 

#### Updates

- 2018-03-17 Update
- 2018-07-08 Update
- 2018-11-17 Adapted for V4.0+
