# CDN

目前和 V2Ray 兼容的 CDN 国外有 Cloudflare，国内阿里云和腾讯云，这三家的 CDN 是支持 WebSocket 的。剩下的几家不支持 WebSocket，也不会 keep TCP connection。因此 HTTP/2 回源也不支持（访问支持 HTTP/2 和回源支持 HTTP/2 是两回事）。
另外，使用国内 CDN 需要域名备案并服务商*实名*认证。使用有风险，入坑需谨慎。

> 腾讯云需要选择业务类型为流媒体点播加速

## 配置

参照 [WebSocket + TLS + Web](https://guide.v2fly.org/advanced/wss_and_web.html) 部分。

## 有关 Cloudflare 的 Firewall（防火墙）问题

最近突然有遇见经过 CDN 的代理完全无法通讯的情况哦。
有趣的是，在 VPS 里没有任何相关日志，并且不走 CDN 的话就可以正常通讯并出现相关日志了呢；而走 CDN 的 Web 可以正常访问，但 Path 界面却出现了 Challenge（Captcha）。
也就是说，问题就在于 Cloudflare 啦。

在 Firewall 界面有看见大量 IP 被拦截的记录，问题 GET👍。
然后又找了一个相关的 [Issues](https://github.com/v2ray/v2ray-core/issues/1742) 作为参考。

稍稍总结一下不同的解决方案：
1. Firewall => Settings => Security Level，设置为 Essentially Off（默认是 Medium，个人实测改为 Low 仍被拦截）。
2. 无需修改 Security Level，而是 Firewall => Tools，将 China（或被 Block 的 IP/ASN）作为 Whitelist。
3. [Issues](https://github.com/v2ray/v2ray-core/issues/1742) 里有提到，可以 Firewall => Firewall Rules，添加 Country => China 或 IP Address =>（被 Block 的 IP）或 URL Path => （wsSettings 里 的那个 path），为 Allow 即可，但个人实测，Activity log 里会显示，先是被 Firewall Rules 所 Allow，随后又被 Security Level 所 Block。

PS：针对解决方案 3，建议各位在出现被拦截的问题之前就进行此操作，本文所提的个人实测是在已经出现被拦截的情况下所进行的哦。
