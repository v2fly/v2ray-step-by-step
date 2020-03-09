# MTProto 代理

V2ray内支持一个让[telegram](https://telegram.org/)使用的代理MTProto。 Telegram官方开发的MTProto代理只能由Telegram程序使用，他不是一个传统意义的代理协议。


## 现状和建议

到目前为止（2020年3月），MTProto协议已经迭代了三代，而V2ray内置的支持MTProto只有第一代，会受到防火墙的精准探测和封锁，因此这里并不推荐使用V2ray提供MTProto服务，而推荐使用专业的MTProto程序，并配置使用最新的第三代FakeTLS模式：

* [9seconds / mtg](https://github.com/9seconds/mtg) (GO语言实现)
* [seriyps / mtproto_proxy](https://github.com/seriyps/mtproto_proxy) (Erlang实现)
* [alexbers / mtprotoproxy](https://github.com/alexbers/mtprotoproxy) (Python实现)
* [TelegramMessenger / MTProxy](https://github.com/TelegramMessenger/MTProxy) (Telegram官方)


::: warning 提醒
MTProto可通过secret字段区分三代的区别：

* 第一代secret为32位16进制字符；
* 第二代secret为`dd`开头加32位16进制字符，一共34位；
* 第三代secret为`ee`开头加不定长的字符，也叫FakeTLS模式；
:::


## V2Ray的MTProto墙内转发

::: warning 提醒
目前在境内假设转发代理服务或许有法律风险，建议仅个人使用。
:::

如果一定要使用V2ray提供的MTProto代理，可以通过在家庭网关配合境外服务器转发实现，以下摘录V2ray作者博客：（原文连接：[如何使用 V2Ray 中新增的 MTProto 代理](https://steemit.com/cn/@v2ray/v2ray-mtproto)）


------

V2Ray 从 3.29 开始增加了一组新的传入传出协议：MTProto Proxy。这个协议是 Telegram 开发的，仅用于 Telegram 流量的代理。

上述的链接中已经附了一个简单的配置方式，这里介绍一个较复杂的用法。

由于 MTProto 是一组对应的传入传出，它实际上没有用到 V2Ray 的优势，比如 TLS + WebSocket。当这个代理有朝一日被检测并屏蔽的时候，简单的搭配可能就用不了了。

如果真到了那么一天，你可能需要在墙内搭一个中传服务器，在这个服务器上接收 MTProto 传入，然后用 VMess 或其它协议把流量中转到墙外，这样被屏蔽的可能性更低。

好了，具体要怎么配置呢？

首先一组传入传出加路由是没有疑问的：

```json
{
  "tag": "tg-in",
  "port": 443,
  "protocol": "mtproto",
  "settings": {
    "users": [{"secret": "b0cbcef5a486d9636472ac27f8e11a9d"}]
  }
}
```

```json
{
  "tag": "tg-out",
  "protocol": "mtproto",
  "settings": {}
}
```

```json
{
  "type": "field",
  "inboundTag": ["tg-in"],
  "outboundTag": "tg-out"
}
```

然后，如果你有一个另外的 VMess 传出，比如你买了一个商用的 VMess 代理，假设配置如下：

```json
{
  "tag": "vmess-out",
  "protocol": "vmess",
  "settings": {
    "vnext": [{
      "address": "v2ray.com",
      "port": 443,
      "users": [{"id": "27848739-7e62-4138-9fd3-098a63964b6b"}]
    }]
  }
}
```

然后我们把tg-out和vmess-out桥接起来就可以了，做法很简单，在tg-out上加一个proxySettings：

```json
{
  "tag": "tg-out",
  "protocol": "mtproto",
  "settings": {},
  "proxySettings": {
    "tag": "vmess-out"  // 把 tg-out 的流量由 vmess-out 转发
  }
}
```

这样就可以让流量走一个类似 tg-in <-> vmess-out <-> vmess-in <-> tg-out 的转发方式。

当然 V2Ray 有其它的自由组合，比如你也可以使用 dokodemo 做透明代理完成上述的中转。但上述做法的好处是，你可以使用第三方的代理（比如买来的），这种情况下没办法修改代理服务器的配置。使用proxySettings可以在不修改下一个代理节点，仅修改当前节点配置的情况下，实现任意协议的中转。

