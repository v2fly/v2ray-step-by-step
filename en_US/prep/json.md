# V2ray configuration file format

The configuration file of V2Ray is JSON format, same as Shadowsocks. However, V2Ray has inevitably more complicated configuration file compared to Shadowsocks due to the number of features supported. Therefore, it is recommended to understand the format of JSON before the start writing your own V2Ray configuration.

For the format of JSON, you may like to check with [V2Ray Official Documents](https://www.v2ray.com/chapter_02/), which provides an introduction simply and clearly.

This section provides just enough introduction of JSON file for configuring V2Ray. (I found some other articles on Google is rather confusing, I guess they are wrote for programmers. There is no need to get confused if you cannot understand those.) In addition to the introduction of the documents I think we have to add a few points:

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


  #### Updates

  - 2018-04-05 Update
  - 2018-07-08 Update

