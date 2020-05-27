# Load Balancing - Continued

As mentioned in the previous chapter,  V2Ray provides load balancing feature. However, the above-mentioned load balancing is implemented by improper configuration, it does not have good performance. Also, there's some people think its polling mechanism is not load balancing at all. However, after a long wait, V2Ray can finally load balance. Note that V2Ray version is required higher than 4.3 in order to enable the new load balancing feature. 

## Configuration

The load balancing is configured in the routing section and only need to be set on the client-side. In routing section, you need to configure an array of balancers that represents the rules for load balancing, each object contains a load-balanced unique label as working strategy (the current policy is random selection only), as an optional outbound proxy. Then configure specific traffic for load balancing as needed in the routing rules. In this example, the last routing rule is load balancing. According to our example: for the destination address is either private IP or mainland China, they will be directly connected; for all other traffic, they will relay to load balancing b1 (that is, choose between jp1 and jp2). Load balancing to b2 is not used in this example.

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
    "domainStrategy": "IPOnDemand",
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

From the configuration, V2Ray's load balancing has the advantage of high flexibility. It can load balance the specified traffic, or configure multiple load balancing as needed. The outbound protocols of different underlying transmission configurations can also be load balanced. It can be said that the flexible routing of V2Ray is so flexible as its load balancing.

Maybe due to balancer is newly implemented, currentlly the only strategy choosing route is random. As time progresses, there may be more strategies available.

#### Updates

- 2018-11-09 Initial Version.
- 2019-11-01 Fix bugs of IP rules do not match
