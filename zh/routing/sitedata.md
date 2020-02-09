# 域名文件

## 內置的域名文件
在下載 V2Ray 的時候，下載的壓縮包有一個 geosite.dat。這個文件是在路由功能裏用到的，文件內置了許多[常見的網站域名](https://github.com/v2ray/domain-list-community)。配置方式如下，geosite 指 geosite.dat 文件，後面的 cn 是一個標籤，代表着使用 geosite.dat 文件裏的 cn 規則。
```json
{
    "type": "field",
    "outboundTag": "direct",
    "domain": [
        "geosite:cn"
    ]
}
```
通過它可以設定這些國內域名走直連,這樣就相當把規則的域名寫到一個文件裏，然後在配置中引用這個域名文件，其中有一個好處是配置比較簡潔，看起來比較乾淨。

## 外置的域名文件

很多時候，V2Ray 內置的國內域名不能滿足使用。不過 V2Ray 可以使用外部自定義的像 geosite.dat 這樣的域名文件，剛好我也製作了一個，可以供大家使用。

1. 到 https://github.com/ToutyRater/V2Ray-SiteDAT/tree/master/geofiles 下載 h2y.dat 文件放到 V2Ray 運行文件的目錄下。
1. 按需要寫路由規則，格式爲 "ext:h2y.dat:tag"。ext 表示使用外部文件；h2y.dat 是具體的文件名；tag 泛指標籤，有哪些標籤由文件提供。步驟 1 下載的 h2y.dat 文件目前只有 `ad` 和 `gfw` 兩個標籤，ad 包含着常見的廣告域名，gfw 包含着常見的被 gfw 屏蔽的域名。它們各自所包含的域名在[這裏](https://github.com/ToutyRater/v2ray-SiteDAT/tree/master/h2y)可以看到。這個域名文件每星期自動更新，如果你使用了我提供的域名文件也請定期更新(打開 https://github.com/ToutyRater/V2Ray-SiteDAT/tree/master/geofiles 看到的都是當時的最新版本)。路由配置示例如下。
1. 運行 V2Ray。
```json
"rules":[
    {
        "type": "field",
        "outboundTag": "block", //攔截廣告相關域名
        "domain": [
            "ext:h2y.dat:ad"
        ]
    },
    {
        "type": "field",
        "outboundTag": "proxy", //被 gfw 屏蔽的域名走代理
        "domain": [
            "ext:h2y.dat:gfw"
        ]
    },
    {
        "type": "field",
        "network":"tcp,udp",
        "outboundTag": "direct" // 默認直連
    }
]
```
因爲使用了 gfw 列表的用戶，通常是想要默認情況下直連，但有時候習慣上在 outbounds 的第一個是代理的出站，所以在上面的配置中，最後加了一條直連的規則。那個`network:"tcp,udp"` 是爲了讓所有流量都能匹配上。

需要注意的是，目前所有第三方的 V2Ray GUI 客戶端都不支持加載外置的域名文件。

#### 更新歷史

- 2018-06-07 初版
- 2018-11-06 刪除不必要的標籤
- 2019-10-31 添加默認直連規則
