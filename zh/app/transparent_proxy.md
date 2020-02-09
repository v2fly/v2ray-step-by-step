# 透明代理

透明代理是什麼意思請自行 Google，在這兒指使用 V2Ray 做透明代理實現路由器翻牆。然而，我個人認爲路由器翻牆的說法並不準確，應該叫網關翻牆。所以本例實際上是關於網關翻牆的內容。當然了，單純使用路由器翻牆也是可以的，因爲普通的家用路由器本就是一個網關。使用網關翻牆可以使局域網內的所有設備都具有直接翻牆的能力，並且能夠全局代理，而不必每臺設備都安裝 V2Ray，配置更新時只需在網關修改配置，用一些網友的話說就是就感覺沒有牆一樣。但是，有意上透明代理的同學請評估一下透明代理是否合適自己，而不要盲目跟風。

透明代理適用於以下情況：
* 局域網設備較多，比如說辦公室、實驗室、大家庭等；
* 設備(的軟件)無法/不方便設置代理，比如說 Chromecast、電視盒子等；
* 希望設備的所有軟件都走代理。


## 優點

其實，V2Ray 早就可以作透明代理，當時我也研究了好一段時間，最終是折騰出來了。但是由於 DNS 的問題，我用着總感覺不太舒服。雖然有 ChinaDNS 這類的解決方案，但個人主觀上並不喜歡。
不過嘛，現在就不一樣了。就目前來說，使用 V2Ray 透明代理：
1. 解決了牆外 DNS 污染問題；
2. 在解決了 1 的情況下國內域名的即能夠解析到國內 CDN；
3. 不需要外部軟件或自建 DNS 就可決絕 1 和 2 的問題，只要系統支持 V2Ray 和 iptables；
4. 能夠完美利用 V2Ray 強大而靈活的路由功能，而不必額外維護一個路由表；

## 準備
* 一個有能力根據實際情況解決遇到問題的人
* 一臺已經搭建 V2Ray 並能正常使用的 VPS ，本文假設 IP 爲 `110.231.43.65`；
* 一臺帶 iptables、有 root 權限並且系統爲 Linux 的設備，假設地址爲 `192.168.1.22`，已經配置好 V2Ray 作爲客戶端。這個設備可以是路由器、開發板、個人電腦、虛擬機和 Android 設備等，更具普適性地稱之爲網關。我個人不建議使用 MT7620 系路由器開透明代理，性能太差了，很多固件也沒有開啓 FPU 。要是真不願意出這點錢，用電腦開個虛擬機吧(我就是這麼幹的)，VirtualBox、Hyper 之類的都可以，但是別忘了網絡模式用網橋。

## 設置步驟

設置步驟如下，假設使用 root。

1. 網關設備開啓 IP 轉發。在 /etc/sysctl.conf 文件添加一行 `net.ipv4.ip_forward=1` ，執行下列命令生效：
```
sysctl -p
```
2. 網關設備設置靜態 IP，與路由器 LAN 口同一個網段，默認網關爲路由器的IP；進入路由器的管理後臺，到 DHCP 設定將默認網關地址爲網關設備的 IP，本例爲 192.168.1.22，或者電腦手機等設備單獨設置默認網關，然後電腦/手機重新連接到路由器測試是不是可以正常上網(這時還不能翻牆)，如果不能上網先去學習一個把這個搞定，否則接下來再怎麼也同樣上不了網。網關設備設定靜態 IP 是爲了避免重啓後 IP 會發生變化導致其他設備無法聯網；路由器設定 DHCP 默認網關地址是爲了讓接入到這個路由器的設備將上網的數據包發到網關設備，然後由網關設備轉發。

3. 在服務器和網關安裝最新版本的 V2Ray（如果不會就參照前面的教程，由於 GFW 會惡化 GitHub Releases 的流量，網關直接運行腳本幾乎無法安裝，建議先下載V2Ray 的壓縮包，然後用安裝腳本通過 --local 參數進行安裝），並配置好配置文件。一定要確定搭建的 V2Ray 能夠正常使用。在網關執行 `curl -x socks5://127.0.0.1:1080 google.com` 測試配置的 V2Ray 是否可以翻牆(命令中 `socks5` 指 inbound 協議爲 socks，`1080` 指該 inbound 端口是 1080)。如果出現類似下面的輸出則可以翻牆，如果沒有出現就說明翻不了，你得仔細檢查以下哪步操作不對或漏了。
```
<HTML><HEAD><meta http-equiv="content-type" content="text/html;charset=utf-8">
<TITLE>301 Moved</TITLE></HEAD><BODY>
<H1>301 Moved</H1>
The document has moved
<A HREF="http://www.google.com/">here</A>.
</BODY></HTML>
```

4. 在網關的配置，添加 dokodemo door 協議的入站配置 ，並開啓 sniffing；還要在所有 outbound 的 streamSettins 添加 SO_MARK。配置形如（配置中的`...`代表原來客戶端的通常配置）：
```json
{
  "routing": {...},
  "inbounds": [
    {
      ...
    },
    {
      "port": 12345, //開放的端口號
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true // 這裏要爲 true 才能接受來自 iptables 的流量
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      }
    }
  ],
  "outbounds": [
    {
      ...
      "streamSettings": {
        ...
        "sockopt": {
          "mark": 255  //這裏是 SO_MARK，用於 iptables 識別，每個 outbound 都要配置；255可以改成其他數值，但要與下面的 iptables 規則對應；如果有多個 outbound，最好將所有 outbound 的 SO_MARK 都設置成一樣的數值
        }
      }
    }
    ...
  ]
}
```

5. 設定 TCP 透明代理的 iptables 規則，命令如下(`#`代表註釋)：

```
iptables -t nat -N V2RAY # 新建一個名爲 V2RAY 的鏈
iptables -t nat -A V2RAY -d 192.168.0.0/16 -j RETURN # 直連 192.168.0.0/16 
iptables -t nat -A V2RAY -p tcp -j RETURN -m mark --mark 0xff # 直連 SO_MARK 爲 0xff 的流量(0xff 是 16 進制數，數值上等同與上面配置的 255)，此規則目的是避免代理本機(網關)流量出現迴環問題
iptables -t nat -A V2RAY -p tcp -j REDIRECT --to-ports 12345 # 其餘流量轉發到 12345 端口（即 V2Ray）
iptables -t nat -A PREROUTING -p tcp -j V2RAY # 對局域網其他設備進行透明代理
iptables -t nat -A OUTPUT -p tcp -j V2RAY # 對本機進行透明代理
```

   然後設定 UDP 流量透明代理的 iptables 規則，命令如下
```
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100
iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -j RETURN
iptables -t mangle -A V2RAY_MASK -p udp -j TPROXY --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -p udp -j V2RAY_MASK
```

6. 使用電腦/手機嘗試直接訪問被牆網站，這時應該是可以訪問的（如果不能，你可能得請教大神手把手指導了）。

7. 寫開機自動加載上述的 iptables 的腳本，或者使用第三方軟件(如 iptables-persistent)，否則網關重啓後 iptables 會失效(即透明代理會失效)。


## 注意事項

* 在上面的設置中，假設訪問了國外網站，如 Google 等，網關依然會使用的系統 DNS 進行查詢，只不過返回的結果是污染過的，而 V2Ray 提供的 sniffing 能夠從流量中提取域名信息交由 VPS 解析。也就是說，每次打算訪問被牆的網站，DNS 提供商都知道，鑑於國內企業尿性，也許 GFW 也都知道，會不會將這些數據收集喂 AI 也未可知。
* sniffing 目前只能從 TLS 和 HTTP 流量中提取域名，如果上網流量有非這兩種類型的慎用 sniffing 解決 DNS 污染。
* 由於對 iptables 不熟，我總感覺上面對 UDP 流量的透明代理的設置使用上有點問題，知道爲什麼的朋友請反饋一下。如果你只是簡單的上上網看看視頻等，可以只代理 TCP 流量，不設 UDP 透明代理。
* 喜歡玩網遊的朋友可能要失望了，使用 V2Ray 加速遊戲效果不是很好。
* V2Ray 只能代理 TCP/UDP 的流量，ICMP 不支持，即就算透明代理成功了之後 ping Google 這類網站也是不通的。
* 按照網上其他的透明代理教程，設置 iptables 肯定要 RETURN 127.0.0.0/8 這類私有地址，但我個人觀點是放到 V2Ray 的路由裏好一些。

-------

#### 更新歷史

* 2017-12-05 初版
* 2017-12-24 修復無法訪問國內網站問題
* 2017-12-27 排版
* 2017-12-29 刪除不必要的 iptables 規則
* 2018-01-16 優化操作步驟
* 2018-01-21 添加 UDP
* 2018-04-05 Update
* 2018-08-30 設置步驟修正
* 2018-09-14 比較優雅地代理本機流量

