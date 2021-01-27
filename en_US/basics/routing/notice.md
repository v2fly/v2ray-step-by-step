
# Notes for routing rules

This section records the mistakes that some novice friends often make when using V2Ray to use the routing function. I hope you can avoid them.

## Wildcard

If I want taobao.com and jd.com to be directly connected, the rules of the routing function are written as below. Do you think there is a problem with this rule?

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "*.taobao.com",
            "*.jd.com"
        ]
    }
]
```
It seems that it is fine, but in fact, it isn't. If you use such a rule, you will find that there is no direct connect for that domain. Very wired? This is not surprising. This is because of your experience. In V2Ray, the asterisk '*' does not have the meaning of a wildcard, just an ordinary character. You think that the asterisk '*' is a wildcard, which is a mistake. If you want to match all subdomains, you can write the rules like this:

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com",
            "domain:jd.com"
        ]
    }
]
```
`domain:` represents a subdomain, such as "domain:taobao.com". This rule contains all taobao.com domain names and their subdomains.

## IP & domain

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ],
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```

There is no problem with such a strict rule. The real problem is that the user does not understand the configuration of the rule. If you want to match the above rules, then the domain name of the destination address that represents this packet is taobao.com and the IP belongs to 192.168.0.0.1/16. Usually, this is not possible, so your visit to Taobao will not match this rule. If you want to match the domain name and IP conditions to match the rules, then you should write:

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ]
    }，
    {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```


## subdomain

## regexp

## private ip
