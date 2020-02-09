# CDN

目前和 V2Ray 兼容的 CDN 國外有 Cloudflare，國內阿里雲，這兩家的 CDN 是支持 WebSocket 的。剩下的幾家不支持 WebSocket，也不會 keep TCP connection。因此 HTTP/2 回源也不支持（訪問支持 HTTP/2 和回源支持 HTTP/2 是兩回事）。
另外，使用國內 CDN 需要域名備案並服務商*實名*認證。使用有風險，入坑需謹慎。

## 配置

參照 [WebSocket + TLS + Web](https://guide.v2fly.org/advanced/wss_and_web.html) 部分。

## 有關 Cloudflare 的 Firewall（防火牆）問題

最近突然有遇見經過 CDN 的代理完全無法通訊的情況哦。
有趣的是，在 VPS 裏沒有任何相關日誌，並且不走 CDN 的話就可以正常通訊並出現相關日誌了呢；而走 CDN 的 Web 可以正常訪問，但 Path 界面卻出現了 Challenge（Captcha）。
也就是說，問題就在於 Cloudflare 啦。

在 Firewall 界面有看見大量 IP 被攔截的記錄，問題 GET👍。
然後又找了一個相關的 [Issues](https://github.com/v2ray/v2ray-core/issues/1742) 作爲參考。

稍稍總結一下不同的解決方案：
1. Firewall => Settings => Security Level，設置爲 Essentially Off（默認是 Medium，個人實測改爲 Low 仍被攔截）。
2. 無需修改 Security Level，而是 Firewall => Tools，將 China（或被 Block 的 IP/ASN）作爲 Whitelist。
3. [Issues](https://github.com/v2ray/v2ray-core/issues/1742) 裏有提到，可以 Firewall => Firewall Rules，添加 Country => China 或 IP Address =>（被 Block 的 IP）或 URL Path => （wsSettings 裏 的那個 path），爲 Allow 即可，但個人實測，Activity log 裏會顯示，先是被 Firewall Rules 所 Allow，隨後又被 Security Level 所 Block。

PS：針對解決方案 3，建議各位在出現被攔截的問題之前就進行此操作，本文所提的個人實測是在已經出現被攔截的情況下所進行的哦。
