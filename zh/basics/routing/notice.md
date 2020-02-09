
# 關於路由規則的注意事項

本節記錄了一些新手朋友使用 V2Ray 使用路由功能時常範的錯誤，希望大家能夠避免。

## 通配符

如果我想讓淘寶和京東的域名直連，路由功能的規則寫成下面這樣的，你覺得這樣的規則有問題嗎？

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "*.taobao.com",
            "*.jd.com"
        ]
    }
]
```
看起來沒有什麼問題，但事實上，有。如果使用了這樣的規則，你會發現根本沒有走 direct 直連。很奇怪？這並不奇怪。這是因爲你的經驗在作祟。在 V2Ray 中，星號 \* 不具備通配符的意義，只是一個普通的字符而已，是你以爲星號 \* 是通配符，這是臆想。如果想要匹配所有子域名的話，可以這麼寫規則：

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com",
            "domain:jd.com"
        ]
    }
]
```
`domain:` 代表子域名，如 "domain:taobao.com" 這樣一條規則包含了所有 taobao.com 域名及其子域名。

## IP & domain

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ],
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```

這樣的一個規則的嚴格來說沒有問題，真正的問題在與使用者不理解規則的配置。如果要匹配以上的規則，那麼代表這有一個數據包的目標地址域名是 taobao.com 並且 IP 屬於 192.168.0.0.1/16。通常情況下這是不可能的，所以你訪問淘寶是不會匹配這個規則。如果你要滿足域名和 IP 任一條件都能夠匹配規則，那麼應該這麼寫：

```json
[
    {
        "type": "field",
        "outboundTag": "direct",
        "domain": [
            "domain:taobao.com"
        ]
    }，
    {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
            "192.168.0.0/16"
        ]
    }
]
```


## subdomain

## regexp

## private ip
