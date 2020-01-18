# CDN

目前和 V2Ray 兼容的 CDN 国外有 Cloudflare，国内阿里云，这两家的 CDN 是支持 WebSocket 的。剩下的几家不支持 WebSocket，也不会 keep TCP connection。因此 HTTP/2 回源也不支持（访问支持 HTTP/2 和回源支持 HTTP/2 是两回事）。
另外，使用国内 CDN 需要域名备案并服务商实名认证。使用有风险，入坑需谨慎。

## 配置

参照WebSocket + TLS + Web部分。不过需要注意，这里的 SSL 证书建议使用来自 CDN 服务商提供的、适用于原始服务器的证书，而不是使用证书申请脚本或者 Caddy 申请的证书。将 CDN 服务商提供的 Key 保存为后缀名为 ```key``` 的文件，再将公钥保存为```crt```格式的文件，然后就可以将其应用于服务器了。
