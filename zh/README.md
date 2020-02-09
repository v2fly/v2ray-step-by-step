# V2Ray 配置指南

## 聲明

感謝 [ToutyRater](https://github.com/ToutyRater) 最初撰寫了這份指南，幫助了無數人跨越長城走向世界。

現在 [原始指南](https://github.com/ToutyRater/v2ray-guide) 將交由 V2Fly 社區繼續維護，歡迎任何形式貢獻，分享你的經驗和配置或者是勘誤/翻譯等等。

目前指南使用 [BY-CC 4.0](https://github.com/v2fly/v2ray-step-by-step/blob/master/LICENSE.md) 授權協議。

## 簡介

V2Ray 是 Project V 下的一個工具。
Project V 是一個包含一系列構建特定網絡環境工具的項目，而 V2Ray 屬於最核心的一個。
> Project V 提供了單一的內核和多種界面操作方式。內核（V2Ray）用於實際的網絡交互、路由等針對網絡數據的處理，而外圍的用戶界面程序提供了方便直接的操作流程。
不過從時間上來說，先有 V2Ray 纔有 Project V。
如果還是不理解，那麼簡單地說，V2Ray 是一個與 Shadowsocks 類似的代理軟件，可以用來科學上網（翻牆）學習國外先進科學技術。

V2Ray 用戶手冊：
 - [https://www.v2ray.com/](https://www.v2ray.com/)（已被牆）
 - [https://www.v2fly.org.](https://www.v2fly.org/)

V2Ray 項目地址：[https://github.com/v2ray/v2ray-core](https://github.com/v2ray/v2ray-core)

V2Ray Telegram 使用羣鏈接：[https://t.me/projectv2ray](https://t.me/v2fly_chat)


## 常見問題：Q&A


#### V2Ray 跟 Shadowsocks 有什麼區別？

Shadowsocks 是一個純粹的代理工具，而 V2Ray 定位爲一個平臺，任何開發者都可以利用 V2Ray 提供的模塊開發出新的代理軟件。

瞭解 Shadowsocks 歷史的同學都知道，Shadowsocks 是 clowwindy 開發的自用的軟件，開發的初衷只是爲了讓自己能夠簡單高效地科學上網，自己使用了很長一段時間後覺得不錯才共享出來的。V2Ray 是 clowwindy 被喝茶之後 V2Ray 項目組爲表示抗議開發的，一開始就致力於讓大家更好更快的科學上網。

由於出生時的歷史背景不同，導致了它們性格特點的差異。

簡單來說，Shadowsocks 功能單一，V2Ray 功能強大。聽起來似乎有點貶低 Shadowsocks 呢？當然不！換一個角度來看，Shadowsocks 簡單好上手，V2Ray 複雜配置多。

#### 既然 V2Ray 複雜，爲什麼要用它？

童鞋，某事物的優點和缺點總是相生相隨的。相對來說，V2Ray 有以下優勢：

* **更完善的協議:** V2Ray 使用了新的自行研發的 VMess 協議，改正了 Shadowsocks 一些已有的缺點，更難被牆檢測到
* **更強大的性能:** 網絡性能更好，具體數據可以看 [V2Ray 官方博客](https://steemit.com/cn/@v2ray/3cjiux)
* **更豐富的功能:** 以下是部分 V2Ray 的功能
    * mKCP: KCP 協議在 V2Ray 上的實現，不必另行安裝 kcptun
    * 動態端口：動態改變通信的端口，對抗對長時間大流量端口的限速封鎖
    * 路由功能：可以隨意設定指定數據包的流向，去廣告、反跟蹤都可以
    * 傳出代理：也可稱爲鏈式代理，通過不斷接力加強隱蔽性
    * 數據包僞裝：類似於 Shadowsocks-rss 的混淆，另外對於 mKCP 的數據包也可僞裝，僞裝常見流量，令識別更困難
    * WebSocket 協議：可以單獨使用 WebSocket 代理。也可以通過它使用 CDN 中轉，抗封鎖效果更好
    * Mux:多路複用，進一步提高科學上網的併發性能

#### 哪有十全十美的東西？

少年悟性很高啊！當然沒有！目前來說，V2Ray 有下面的缺點：
- 配置複雜
- 產業鏈不成熟

#### 聽你說了這麼多，好像 V2Ray 還不錯的樣子。但我只是要翻翻牆而已，不想花太多時間怎麼辦？

無論做什麼都是有代價的，付出不一定有收穫，但是不付出肯定沒有收穫。

#### 我決定嘗試一下 V2Ray，那麼我該如何使用這個指南？

V2Ray 的用戶手冊非常詳細地解釋了 V2Ray，本指南主要以實際可用的配置從易到難來講解 V2Ray 的功能特性，力求降低新手使用 V2Ray 的難度。

**本指南的目標用戶是有一定的 Linux 操作基礎，像怎麼註冊 VPS，怎麼用 SSH 登錄 VPS，怎麼使用 nano（或 vi/vim）編輯一個文本以及一些 Linux 基本命令的使用······網上有一大堆的指南，沒必要重複造輪子再寫一篇教程，如果這些你不會，強烈建議你去學會了再來嘗試搭建 V2Ray。**

本指南可以看作 V2Ray 用戶手冊的簡易版本，也可以看作 V2Ray 的實踐指導。

你可以在不參考用戶手冊的情況下按照本指南的指導去搭建配置 V2Ray，但我並不建議你這麼做。因爲本指南只是引導大家如何理解和配置 V2Ray，相較於用戶手冊來說有一定的取捨，會忽略一部分東西。所以我希望大家也花時間去閱讀 V2Ray 用戶手冊。

#### 剛開始使用 V2Ray，有什麼需要注意的嗎？

由於許多 V2Ray 用戶都有使用過 Shadowsocks 的經驗，基本上可以按照使用 Shadowsocks 那樣使用。但是 V2Ray 還是和 Shadowsocks 不太一樣，所以我大概說一下使用上的差異。請注意，差異不代表好壞或優劣，如果一個事物必須擁有其他同類所擁有的東西，那麼它也就沒有了存在的意義。

- 客戶端：V2Ray 本身只是一個內核，V2Ray 上的圖形客戶端大多是調用 V2Ray 內核套一個圖形界面的外殼，類似於 Linux 內核和 Linux 操作系統的關係；而 Shadowsocks 的客戶端都是自己重新實現了一遍 Shadowsocks 協議。本文的內容短期內不涉及圖形客戶端的使用。
- 分流：也許大家第一反應是 PAC，實際上，無論 Shadowsocks（特指 Shadowsocks-libev）還是 V2Ray，其本身是不支持 PAC 的，都是客戶端加進來的；Shadowsocks 的分流使用 ACL，V2Ray 使用自己實現的路由功能，孰優孰劣只是仁者智者的問題。
- 分享鏈接/二維碼：V2Ray 不像 Shadowsocks 那樣有統一規定的 URL 格式，所以各個 V2Ray 圖形客戶端的分享鏈接/二維碼不一定通用。
- 加密方式：V2Ray（特指 VMess 協議）不像 Shadowsocks 那樣看重對加密方式的選擇，並且 VMess 的加密方式是由客戶端指定的，服務器自適應。
- 時間：使用 V2Ray 要保證時間準確，因爲這是爲了安全設計的。
- 密碼：V2Ray（VMesss）只有 id（使用 UUID 的格式），作用類似於 Shadowsocks 的密碼，但隨機性遠好於 Shadowsocks 的密碼，只是不太方便記憶（安全和方便的矛盾）。
- UDP 轉發：VMess 是基於 TCP 的協議，對於 UDP 包 V2Ray 會轉成 TCP 再傳輸的，即 UDP over TCP。需要 UDP 轉發功能的話，在客戶端的 socks 協議中開啓 UDP 即可。
- 路由器翻牆：實際上它們並沒有什麼區別，不要以爲沒有插件就不能在路由器上用，看事物請看本質。
