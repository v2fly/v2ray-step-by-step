# Summary

Let's make a summary

### Format of configuration file

Configuration file of V2Ray is like below codes:

```json
{
  "log": {},
  "inbounds": [],
  "outbounds": [],
  "routing": {},
  "transport": {},
  "dns": {},
  "reverse": {},
  "policy": {},
  "stats": {},
  "api": {}
}
```

In general, V2Ray's configuration has 10 terms, and each term can be further expanded into a more specific configuration. Among these configuration terms, this chapter refers to the first four terms. The terms `dns`, `transport`, and `reverse` will be explained later. The contents of `api`, `policy` and `stats` are not available yet, so please read the manual carefully. For details on the configuration file, refer to the  [user manual](https://www.v2fly.org/en_US/v5/config/overview.html).

To understand the working mechanism of V2Ray, we must first change the concept of client and server (the tutorial says that the client and server are used to it). We should understand the concept of a transit node. V2Ray is just a software that forwards data, as long as it receives packets from the portal, regardless of what V2Ray does for those packets (encryption, decryption, protocol conversion, etc.), in the end it must be sent out from the exit. Each running V2Ray is a node that receives data from the previous node and sends it to the next node. In such a proxy chain consisting of multiple nodes, the first node and the last node are the clients and servers we often say. More broadly, each node is a server for the previous node and a client for the next node.



### Protocol

Whether it is incoming or outgoing, the first thing we need to make clear is the protocol. Only when the protocol parameters are correct we can communicate normally.

The incoming protocols for V2Ray are HTTP, SOCKS, VMess, Shadowsocks, and Dokodemo-door; the outgoing protocols are VMess, Shadowsocks, Blackhole, Freedom, and SOCKS.

In inbounds and outbounds terms, the configuration format of inbounds or outbounds is the same regardless of the protocol used. The only difference is that the settings of the different protocols are different.

-----
#### Updates

- 2018-04-05 Add more details
- 2018-11-09 Adapt to v4.0+ configuration format.
- 2019-07-12 Update the link of manual
