# V2ray configuration file format

The configuration file of V2Ray is in JSON format, and the configuration of Shadowsocks is also in JSON format. However, because V2Ray supports many functions, the configuration is inevitably more complicated. Therefore, it is recommended to understand the format of JSON before the actual configuration.
Regarding the format of JSON, you can see [V2Ray Document](https://www.v2fly.org/en_US/v5/config/overview.html). The introduction inside is simple and clear. Just configure V2Ray and just look at it here. (I searched about JSON on Google The article is rather long-winded, I guess it’s for programmers, so we don’t need to get confused. In addition, I think I need to add a few points to the introduction of the document:

- All punctuation marks in JSON file must use half-width symbols (English symbols)
- All strings must be enclosed in double quotes `" "`, as all keys strings, so keys should also be enclosed in double quotes. For values, if it's a string it needs quotes, while numbers do not need to be double quoted.
- Boolean types do not need to be double quoted. Only two booleans are true and false.
- Objects are unordered, so the order of the contents enclosed by braces `{ }` doesn't matter, for example:

  ```json
  {
    "ip":"8.8.8.8",
    "port":53,
    "isDNS":true
  }
  ```

  ```json
  {
    "ip":"8.8.8.8",
    "isDNS":true,
    "port":53
  }
  ```

  The above two JSONs are actually equivalent.
