# Load Balancing - Continued

As mentioned in the previous chapter, we can load balancing with a V2Ray feature. However, since that kind of load balancing is implemented by improper configure V2Ray, it may not perform that well. Also there's some people think that this polling mechanism is not load balancing at all. However, after a long wait, V2Ray can finally load balance. Note that you need your have version higher than 4.3 in order to use load balancing feature. 

## Configuration Example

The load balancing configuration is located in the routing section and only need to be configure on the client side. In routing, configure a array of balancers that represents the rules for load balancing, each object contains a load-balanced unique label, an equalization strategy (the current strategy seems to have only a random selection), and an optional outbound proxy. Then configure specific traffic for load balancing as needed in the routing rules. In this example, the last routing rule is load balancing. According to the example, it can be known that the destination address is private IP or mainland China traffic direct connection, and all other traffic is load balancing b1 (that is, choose between jp1 and jp2). Load balancing to b2 is not used in this example.

```json
{

  "inbounds": [
    ...
  ],
  "outbounds": [
    {
      "tag": "us1",
      ...
    },
    {
      "tag": "jp1",
      ...
    },
    {
      "tag": "jp2",
      ...
    },
    {
      "tag": "hk1",
      ...
    },
    {
      "tag": "direct",
      ...
    }
  ],
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "balancers": [
      {
        "tag": "b1",
        "selector": [
          "jp1",
          "jp2"
        ]
      },
      {
        "tag": "b2",
        "selector": [
          "us1",
          "hk1"
        ]
      }
    ],
    "rules": [
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:private",
          "geoip:cn"
        ]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
          "geosite:cn"
        ]
      },
      {
        "type": "field",
        "network": "tcp,udp",
        "balancerTag": "b1"
      }
    ]
  }
}
```

From the configuration, it's easy to found V2Ray's load balancing also has the advantage of high flexibility. It can load balance the specified traffic, or configure multiple load balancing as needed. The outbound protocols of different underlying transmission configurations can also be load balanced. It can be said that the flexible routing of V2Ray is so flexible as its load balancing.

Maybe due to balancer is newly implemented, currentlly the only strategy choosing route is random. As time progresses, there may be more strategies available.

#### Updates

- 2018-11-09 Initial Version.
