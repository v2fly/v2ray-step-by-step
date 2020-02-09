# 高級篇

恭喜大家來到高級篇。

使用基礎篇當中的配置案例已經能夠滿足基本的科學上網需求，但 V2Ray 提供了許多額外的功能，可以帶來更好的上網體驗。在本篇當中，將針對某個功能簡要介紹，並給出關鍵配置，因此可能不是完整的，也不會像基礎篇那樣詳細，只會在關鍵之處作一些必要的介紹。

V2Ray 的相比其它工具有一大優點是可以自行選擇傳輸層的形式，也就是說 V2Ray 服務器和客戶端之間的傳輸的數據包形式我們是可以選擇的。如我們可以選擇僞裝成 HTTP（TCP）流量，如果使用了 mKCP 也可以僞裝成 BT 下載、視頻通話、微信視頻通話。也可以選擇使用 WebSokcs 或者 TLS。以上這個都是傳輸層的配置決定的。

V2Ray 中傳輸層配置在 transport 裏設定，也可以在 inbound/outbound 中的 streamSettings 設定。這兩者的區別是 inbound/outbound 的 streamSettings 只對當前的 inbound/outbound 有效（分連接配置），不影響其它的 inbound/outbound 的傳輸層配置，而 transport 是全局的，對整個配置所有的 inbound 和 outbound 都有效（全局配置），如果一個 inbound/outbound 中設定了 streamSettings，transport 的全局設定不會影響這個 inbound/outbound。

在本篇當中，大部分內容都涉及到了傳輸層，關於這部分內容使用的是 inbound/outbound 的 streamSettings（分連接配置），同時也建議大家使用分連接配置。因爲通常情況下我們會有在不同的 inbound/outbound 中使用不同的傳輸層配置。 
