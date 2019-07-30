## Load Balancing

Unlike Shadowsocks and other protocals, V2Ray supports multi-server load-balancing configurations. To be clear, load-balancing means the traffic is split up and sent to multiple servers, rather than the client selecting the best server based on ping or speed and sending all traffic through the single server. The result is a lower resource cost on individual servers and a more spread out traffic balance among the servers. Here's my story as an example. Back in the days when V2Ray was less optimized and all I had was low-spec VPS's with plentiful bandwidth, whenever downloading full speed through a server, I could see CPU usage on the server staying above 80% constantly and sometimes reaching above 95%. I had to limit my download speed in case the VPS provider cancel my services. In contrast, with load-balancing configured on my client, CPU usage of my servers would go 50% tops and I didn't have to limit my download speed anymore. More than 1 year later I've moved on from the low-spec servers, coupled with a more efficient V2Ray protocol, I found there's no need to load-balance for saving CPU time. However, as people still ask about it now and then, I'll still writing all these down so you'll know load-balancing is still an option in case you need it.

## Configuration Example

Configuring load-balancing is an easy job on the client. In the configuration file, simply list all the servers (that are already up and running) in the vnext section in the "outbound" rule. For example: 
```json
{
  "inbounds": [
  ...
  ],
  "outbound": [
    {
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "address_of_vps1",
            "port": 8232,
            "users": [
              {
                "id": "1ce383ea-13e9-4939-9b1d-20d67135969a",
                "alterId": 64
              }
            ]
          },
          {
            "address": "address_of_vps2",
            "port": 4822,
            "users": [
              {
                "id": "bc172445-4b5e-49b2-a712-12c5295fd26b",
                "alterId": 64
              }
            ]
          }
          //list more servers if needed
        ]
      },
      "streamSettings": {
      ...
      }
    },
    ...
  ]
}
```

## Mechanism

Load-balancing is implemented by polling the servers in order. When traffic comes through the tunnel, the first connection goes to the first server listed in "vnext" section, the next connection goes to the next server. After the last server was polled, the first server in the list would be up next, so on and so forth. It sounds stupidly simple and it works very well if you own multiple low-spec VPS's. Load-balancing reduces the chance of transmitting a significant amount of traffic to and from a specific IP address during an extended amount of time. Although I really doubt these are the characteristics the firewalls are looking for (given there's not enough samples), it's better than nothing I guess.

## Note

Make sure values such as port, ID for each individual servers  in the "vmess" section match the ones in "streamSettings".

#### Updates

- 2018-01-03 Initial Version.
- 2018-04-05 Update
- 2019-01-13 v4.0+ Adaptation
