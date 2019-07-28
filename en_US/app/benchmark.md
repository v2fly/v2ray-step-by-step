# Benchmark

Unit is MBytes/s, for reference only. The test method and tools may refer to this article [Benchmark for V2ray](https://steemit.com/cn/@v2ray/3cjiux) 

## PC Virtual machine (amd64)

### VMess performance

-|Direct connect|freedom( V2Ray v3.10 ) |freedom( V2Ray v3.5 ) | freedom(V2Ray v2.46 )| freedom( V2Ray v2.19 )
-|:-:|:-:| :-:|:-:|:-:|
Speed|2925|1137|249|1024|426

 -|TCP( v3.10 ) | TCP( v3.5 ) | WS( v3.5 )| TCP( v2.46 ) | WS( v2.46 )|TCP( v2.19 ) | WS( v2.19 )|
-|:-:|:-:|:-:|:-:|:-:|:-:|:-:
AES-128-CFB|99|75|66|110|105|102|102
AES-128-GCM|341|151|124|341|307|256|256
CHACHA20-POLY1305|236|128|105|246|219|227|227
NONE|563|163|105|192|153|292|292

### Shadowsocks performance

-| V2Ray( v3.5 ) implementation | ss-libev( 3.1.2 )| ss-libev( 2.6.3 ) |
-|:-:|:-:|:-:|:-:
AES-128-CFB|105|73|52
AES-256-CFB|97|66|45
AES-128-GCM|146|47|-
AES-256-GCM|146|45|-
CHACHA20-POLY1305|128|73|-


## Raspberry Pi 3 Model b

-|Direct connect|freedom( V2Ray v3.5 ) | freedom(V2Ray v2.46 )
-|:-:|:-:|:-:
Speed|320|27|27

 -| TCP( v3.5 ) | WS( v3.5 ) | TCP( v2.46 )
-|:-:|:-:|:-:
AES-128-CFB|3|2|3
AES-128-GCM|1.7|-|1.7
CHACHA20-POLY1305|5|4|5
NONE|21|12|22
