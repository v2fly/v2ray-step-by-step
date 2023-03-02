# V2Ray 配置指南

## 声明

感谢 ToutyRater 最初撰写了这份指南，帮助了无数人跨越长城走向世界。

现在 [原始指南](https://github.com/ToutyRater/v2ray-guide) 将交由 V2Fly 社区继续维护，欢迎任何形式贡献，分享你的经验和配置或者是勘误/翻译等等。

目前指南使用 [CC BY 4.0](`LICENSE.md`) 授权协议

## 简介

V2Ray 是 Project V 下的一个工具。Project V 是一个包含一系列构建特定网络环境工具的项目，而 V2Ray 属于最核心的一个。 官方介绍中 `Project V 提供了单一的内核和多种界面操作方式。内核（V2Ray）用于实际的网络交互、路由等针对网络数据的处理，而外围的用户界面程序提供了方便直接的操作流程。` 不过从时间上来说，先有 V2Ray 才有 Project V。
如果还是不理解，那么简单地说，V2Ray 是一个与 Shadowsocks 类似的代理软件，可以用来科学上网（翻墙）学习国外先进科学技术。

V2Ray 用户手册：
 - [https://v2fly.org](https://v2fly.org)

V2Ray 项目地址：[https://github.com/v2fly/v2ray-core](https://github.com/v2fly/v2ray-core)


## 常见问题：Q&A


#### V2Ray 跟 Shadowsocks 有什么区别

Shadowsocks 是一个纯粹的代理工具，而 V2Ray 定位为一个平台，任何开发者都可以利用 V2Ray 提供的模块开发出新的代理软件。

了解 Shadowsocks 历史的同学都知道，Shadowsocks 是 clowwindy 开发的自用的软件，开发的初衷只是为了让自己能够简单高效地科学上网，自己使用了很长一段时间后觉得不错才共享出来的。V2Ray 是 clowwindy 被喝茶之后 V2Ray 项目组为表示抗议开发的，一开始就致力于让大家更好更快的科学上网。

由于出生时的历史背景不同，导致了它们性格特点的差异。

简单来说，Shadowsocks 功能单一，V2Ray 功能强大。听起来似乎有点贬低 Shadowsocks 呢？当然不！换一个角度来看，Shadowsocks 简单好上手，V2Ray 复杂配置多。

#### 听你说了这么多，好像 V2Ray 还不错的样子。但我只是要翻翻墙而已，不想花太多时间怎么办

无论做什么都是有代价的，付出不一定有收获，但是不付出肯定没有收获。

#### 我决定尝试一下 V2Ray，那么我该如何使用这个指南

V2Ray 的用户手册非常详细地解释了 V2Ray，本指南主要以实际可用的配置从易到难来讲解 V2Ray 的功能特性，力求降低新手使用 V2Ray 的难度。

**本指南的目标用户是有一定的 Linux 操作基础，像怎么注册 VPS，怎么用 SSH 登录 VPS，怎么使用 nano（或 vim）编辑一个文本以及一些 Linux 基本命令的使用件网上有一大堆的指南，没必要重复造轮子再写一篇教程，如果这些你不会，强烈建议你去学会了再来尝试搭建 V2Ray。**

本指南可以看作 V2Ray 用户手册的简易版本，也可以看作 V2Ray 的实践指导。

你可以在不参考用户手册的情况下按照本指南的指导去搭建配置 V2Ray ，但我并不建议你这么做。因为本指南只是引导大家如何理解和配置 V2Ray，相较于用户手册来说有一定的取舍，会忽略一部分东西。所以我希望大家也花时间去阅读 V2Ray 用户手册。

#### 刚开始使用 V2Ray，有什么需要注意的吗

由于许多 V2Ray 用户都有使用过 Shadowsocks 的经验，基本上可以按照使用 Shadowsocks 那样使用。但是 V2Ray 还是和 Shadowsocks 不太一样，所以我大概说一下使用上的差异。请注意，差异不代表好坏或优劣，如果一个事物必须拥有其他同类所拥有的东西，那么它也就没有了存在的意义。

- 客户端：V2Ray 本身只是一个内核，V2Ray 上的图形客户端大多是调用 V2Ray 内核套一个图形界面的外壳，类似于 Linux 内核和 Linux 操作系统的关系；而 Shadowsocks 的客户端都是自己重新实现了一遍 Shadowsocks 协议。本文的内容短期内不涉及图形客户端的使用。
- 分流：也许大家第一反应是 PAC，实际上无论是 Shadowsocks（特指 Shadowsocks-libev）还是 V2Ray 本身不支持 PAC，都是客户端加进来的；Shadowsocks 的分流使用 ACL，V2Ray 使用自己实现的路由功能，孰优孰劣只是仁者智者的问题。
- 分享链接/二维码：V2Ray 不像 Shadowsocks 那样有统一规定的 URL 格式，所以各个 V2Ray 图形客户端的分享链接/二维码不一定通用。
- 加密方式：V2Ray（特指 VMess 协议）不像 Shadowsocks 那样看重对加密方式的选择，并且 VMess 的加密方式是由客户端指定的，服务器自适应。
- 时间：使用 V2Ray 要保证时间准确，因为这是为了安全设计的。
- 密码：V2Ray（VMess）只有 id（使用 UUID 的格式），作用类似于 Shadowsocks 的密码，但随机性远好于 Shadowsocks 的密码，只是不太方便记忆（安全和方便的矛盾）。
- UDP 转发：VMess 是基于 TCP 的协议，对于 UDP 包 V2Ray 会转成 TCP 再传输的，即 UDP over TCP。要 UDP 转发功能在客户端的 socks 协议中开启 UDP 即可。
- 路由器翻墙：实际上它们并没有什么区别，不要以为没有插件就不能在路由器上用，看事物请看本质。
