# Routing of V2Ray

In this section, we will introduce the built-in routing feature of V2Ray, use which you can customize some rules according to your network environment with. The simplest and most common is to directly connect to specific websites of countries, or intercept sites, and proxy the blocked sites.

## Introduction of routing

There are some simple example of client-side

```json
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
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

The configuration above is the client configuration file of the previous VMess. If you change the content of the outbound, it becomes like this:

```json
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom", // In previous section, here is V2Ray, we replace it with freedom
      "settings": {
      }
    }
  ]
}
```

If you change this configuration and restarting the client, you will find that the browser does not set the proxy at this time. The website that is walled like Google cannot be accessed. The domestic website of Taobao can still be used as usual. If it is the previous introduction to VMess, the flow of the packet is:
```plain
{Browser} <--(socks)--> {V2Ray client inbound <-> V2Ray client outbound} <--(VMess)--> {V2Ray server inbound <-> V2Ray server outbound} <--(Freedom)--> {target website}
```
Because the outbound of the V2Ray client is now set to freedom, freedom is directly connected, the modified packet flow becomes like this:
```plain
{Browser} <--(socks)--> {V2Ray client inbound <-> V2Ray client outbound} <--(Freedom)--> {target website}
```
After receiving the data from inbound, the V2Ray client does not pass through the VPS, but is sent directly by freedom, so the effect is the same as directly accessing a website.

Then looking at this:

```json
{
  "log":{
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "blackhole",
      "settings": {
      }
    }
  ]
}
```

After this configuration loaded, you will find that no website is accessible. Why is this happening? In V2Ray, blackhole is almost equivalent to a black hole. That is to say, V2Ray sends outbound data after receiving data from inbound. Because outbound is blackhole, what is swallowed will not be forwarded to the server or the target website. What to block access to what you want to access.

Here four outbound protocols have been introduced, the VMess and Shadowsocks protocols for proxies, the freedom protocol for direct connections, and the blackhole protocol for blocking connections. These protocols work with the routing features to set a 'smart' proxy, directly connect or intercept different websites according to your own needs. To give a simple example, the most common case is proxying the blocked websites, direct connecting the Chinese website, and others website that we don't like are intercepted (for example, Baidu's high-precision positioning).

Should we run for three V2Ray process for three outbounds?

Not in the V2Ray configuration! Here the `outbounds` is a collection of export protocols. You can put as many export protocols as you want, not only 3 but 300. An example of placing three export protocol configurations is given below.

```json
{
  "log": {
    "loglevel": "warning",
    "access": "D:\\v2ray\\access.log",
    "error": "D:\\v2ray\\error.log"
  },
  "inbounds": [
    {
      "port": 1080,
      "protocol": "socks",
      "settings": {
        "auth": "noauth"  
      }
    }
  ],
  "outbounds": [ 
    {
      "protocol": "vmess", // 出口协议
      "settings": {
        "vnext": [
          {
            "address": "serveraddr.com", // IP address of server
            "port": 16823,  // Server listening port
            "users": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811",  // UUID
                "alterId": 64
              }
            ]
          }
        ]
      }
    },
    {
      "protocol": "freedom",
      "settings": {}
    },
    {
      "protocol": "blackhole",
      "settings": {}
    }
  ]
}
```

Of course, this configuration only contains multiple outgoing protocols. In the case of multiple outgoing protocols, only the first exit in outbounds is used as the default exit. In order to achieve the rules, the configuration of the routing term must be added. See the next two sections for the configuration of the routing features.

#### Updates

- 2018-11-09 Adapt to v4.0+ configuration format.
