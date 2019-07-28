# Guide to V2Ray configuration

## Disclaimer

This repository is a fork of `ToutyRater/v2ray-guide`, thank you to help many people cross the GFW.

As we want to make [the original guide of V2Ray](https://github.com/ToutyRater/v2ray-guide) more well-maintained and up-to-date, as well as multi-lingual, we forked this new repository. You are welcome to contribute your experience, translation and making a correction to this document by opening an issue.

The documents now licensed under [BY-CC 4.0](`LICENSE.md`).

## Introduction

V2Ray is a tool under Project V. Project V is a project that includes a set of tools for building specific network environments, and V2Ray is the core one. The Project V manual said `Project V is a set of tools to help you build your own privacy network over the internet. The core of Project V, named V2Ray, is responsible for network protocols and communications. It can work alone, as well as combine with other tools.` However, in terms of starting time, Project V is before than V2Ray.

If you still don't understand, then we simply say, V2Ray is a similar proxy software to Shadowsocks. V2Ray can be used to access the internet (over the censorship) to learn advanced foreign science and technology.

V2Ray User manual:
 - [https://www.v2ray.com](https://www.v2ray.com) (Has been blocked in China)
 - [https://v2fly.org](https://v2fly.org)

V2Ray repository address: [https://github.com/v2ray/v2ray-core](https://github.com/v2ray/v2ray-core)
V2Ray repository address (V2Fly repository): [https://github.com/v2ray/v2ray-core](https://github.com/v2fly/v2ray-core)

V2Ray Telegram user discussion group: [https://t.me/projectv2ray](https://t.me/v2fly_chat)


## Frequent questions: Q&A


#### What is the difference between V2Ray and Shadowsocks?

The difference is still that Shadowsocks is just a simple proxy tool; it is a protocol of encryption. However, V2Ray is positioned as a platform, and any developer can use the modules provided by V2Ray to develop new proxy software.

Anyone who knows the history of Shadowsocks knows that Shadowsocks is a self-using software developed by clowwindy. The original intention of the development is to make it easy and efficient to cross the firewall. It has been used for a long time, and he found it would be beneficial to make it opensource. V2Ray is developed after clowwindy receive the menace from the Chinese government, the Project V team developed as a protest. 

Due to the different historical backgrounds at birth, they have different characteristics of their features.

Merely speaking, Shadowsocks has a single proxy protocol, and V2Ray is more complicated than a single protocol proxy. Sounds a bit bleak to Shadowsocks? of course not! From another point of view, Shadowsocks is easy to get started, and V2Ray has a lot of complicated configurations.

#### Since V2Ray is complicated, why using it?

The advantages and disadvantages of something always come along. Relatively speaking, V2Ray has the following advantages:

* ** A new and powerful protocol: ** V2Ray uses the new self-developed VMess protocol, which improves some of the existing shortcomings of Shadowsocks and is more difficult to detect by the firewall.
* ** Better performance: ** Better network performance, specific data can be seen [V2Ray official blog](https://steemit.com/cn/@v2ray/3cjiux)
* ** More features:** The following are some of the features of V2Ray:
    * mKCP: KCP protocol implementation on V2Ray, you don't need to install another kcptun.
    * Dynamic port: dynamically change the communication port to combat the speed limit blocking of long-term high-flow ports
    * Routing feature: you can freely set the flow direction of the specified data packet, to block advertisements and enable anti-tracking
    * Outbound proxy, or say chain proxy, uses many links for better privacy
    * Obfuscation: similar to the obfuscation of ShadowsocksR, and the data package for mKCP can also be obfuscated. Obfuscating the traffic packets other protocol traffic, making inspection more difficult
    * WebSocket protocol: Only use WebSocket proxy, or for CDN intermediate proxy (better anti-blocking)
    * Mux: Multiplexing, further improving the concurrent performance of the proxy

#### No sliver bullet

For now, V2Ray has the following disadvantages:
- Complex configuration
- Lack of 3rd-party clients and services

#### It seems V2Ray good, but I just want to cross the internet censorship, don't want to waste too long time. How can I do?

No matter what you do, there is a effort. Effort does not mean success, but no effort definitely suggest no gains.

#### I decided to try V2Ray, so how do I use this guide?

V2Ray's user manual explains everything in great detail. This guide mainly explains the features of V2Ray from easy to difficult in practically available configurations, and strives to reduce the difficulty of newcomers using V2Ray.

** The users of this guide should have some Linux shell experiences, such as how to buy a VPS, how to log in to VPS with SSH, how to use nano (or vim) to edit a text and some basic Linux commands. There are many guides online. There is no need to repeat them and write a tutorial. If you don't have any experience, you are strongly encouraged that you learn them in prior, then deploy V2Ray. **

This guide can be seen as a simple version of the V2Ray user manual or as a practical guide to V2Ray.

You can follow the instructions in this guide to build V2Ray without reading this user manual, but we don't recommend it. Because this guide is just to guide you on how to configure V2Ray. There are certain shortcuts compared to the user manual, and something is ignored. So we hope everyone spends to read the V2Ray user manual.

#### Just starting to use V2Ray, what do you I to pay attention to?

Since many V2Ray users have experience with Shadowsocks, they can basically use V2Ray like Shadowsocks. However, V2Ray is not quite the same as Shadowsocks so that we will introduce the differences in usage. Please note that the difference does not mean good or bad. If a thing must have something owned by the same kind, then it has no meaning of existence.

- Client: V2Ray itself is just a kernel. The GUI client of V2Ray is mostly a shell called V2Ray kernel, similar to the relationship between Linux kernel and Linux operating system. But many clients of Shadowsocks are re-implemented the protocol by author. The content of this article does not involve the use of GUI clients at this moment.
- Policy proxy: Perhaps the first imagination is PAC. Whether Shadowsocks (specifically Shadowsocks-libev) or V2Ray themselves do not support PAC, it controlled by the user client. Whereas Shadowsocks uses ACL, V2Ray uses its routing function, and we do not say which is good or bad. You can choose the better one, depends on you.

- Share Link/QR Code: V2Ray does not have a uniform URL format like Shadowsocks, so the shared link/QR code of each V2Ray graphics client is not necessarily universal. However, we are working on the protocol implementation of the V2Ray endpoint protocol. It will provides a universal link for V2Ray clients.
- Encryption: V2Ray (specifically VMess protocol) does not like Shadowsocks, which emphasizes the choice of encryption, and VMess encryption is specified by the client, the server is adaptive.
- Time: Use V2Ray to ensure accurate time, as this is for safe design.
- Password: V2Ray (VMesss) only uses UUID, which acts like Shadowsocks' password, but randomness is much better than Shadowsocks' password, but it is not convenient to remember (safety and convenience contradiction).
- UDP relay: VMess is a TCP-based stream protocol. For UDP packets, V2Ray will be converted to TCP and then relay packets. That is, UDP over TCP. To enable UDP, you can enable UDP in the client's socks protocol.
- Gateway proxy: In fact, they are no different. Don't think that you can't use them on the router without plug-ins.
