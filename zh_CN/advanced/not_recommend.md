# 不推荐的配置

* TCP + VMESS

v4.23.2 及之前版本 VMESS 包含严重的设计和实现缺陷 [#2523](https://github.com/v2ray/v2ray-core/issues/2523)，仅需 16 次探测即可准确判定 VMESS 服务，虽然 v4.23.3 已紧急修复，但是此次修复不是永久性的仍然不建议使用。

* mKCP / mKCP + TLS

大部分运营商会针对 UDP 流量进行 QoS，导致频繁断流。

* HTTP/2 + TLS

Overhead 太严重，显著降低速度。
