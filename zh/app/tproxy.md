# 透明代理(TPROXY)

原來出過一篇[透明代理的教程](https://guide.v2fly.org/app/transparent_proxy.html)，但過了許久，V2Ray 也已經迭代了好多個版本。原來的教程依舊可以正常使用，但隨着 V2Ray 的更新，V2Ray 推出了新的透明代理方式—— TPROXY，原來的叫 REDIRECT。最近測試了一下 TPROXY ，效果還不錯，主觀感覺比 REDIRECT 好。並且在本文的透明代理中，DNS 服務將由 V2Ray 提供。不過這種方式需要 iptables 的 TPROXY 模塊支持，有一些閹割版的系統會精簡掉 TPROXY 模塊，這種系統是不適用於本文的。

普通家庭大多數是光纖入戶接光貓調製解調，一個路由器的 WAN 口接光貓的 LAN 口，要上網的設備（如 PC 、電視盒子、手機）接路由器 LAN 口。本文的透明代理需要一臺 Linux 主機接路由器 LAN 口，作爲局域網中的網關，爲其他接入局域網中的設備提供翻牆功能。這樣的方式與我原來的透明代理教程是一樣的，都是搭建在一個 Linux 主機上。這樣可以透明代理的設備，有的人叫“透明網關”，也有的叫“旁路由”。我覺得這種不是很嚴肅的場合，叫什麼都行，只要不妨礙理解。

很多設備都可以做透明網關，路由器、開發板、個人電腦、虛擬機和 Android 設備等。路由器可能比較特殊點，因爲它本身就可以充當網關。上面可能說得太抽象，我就舉些實際的，比如說樹莓派、香橙派、用 PC 裝的 Linux 虛擬機、淘寶的工控機（如j1900）、NAS、電視盒子（如翻車迅）、你剛配的牙膏廠或農廠的電腦，這些都沒問題。至於到底用什麼？這得看需求，我覺得網絡 200M 以下搞個高性能的類樹莓派的 SBC 就夠了，200M 以上就得考慮 X86 主機了（如今甚火的軟路由）。當然，到底怎麼選擇還是得看自己。

本文假設你已經有一個設備（就以樹莓派舉例），將用來作網關（或說旁路由），並且已經安裝好 Linux。關於系統，我更推薦 Debian 或 Debian 衍生版。爲方面起見，本文均以 root 權限賬戶執行命令。並且有一臺 PC 以便於操作。

## 設置網關

1. 用網線將樹莓派接入路由器 LAN 口，假設分給樹莓派的 IP 是 192.168.1.22。
2. 樹莓派開啓 IP 轉發（需要開啓 IP 轉發才能作爲網關）。命令爲 `echo net.ipv4.ip_forward=1 >> /etc/sysctl.conf && sysctl -p`。執行後將出現 net.ipv4.ip_forward=1 的提示。
3. 手動配置 PC 的網絡，將默認網關指向樹莓派的地址即 `192.168.1.22`。此時 PC 應當能正常上網（由於還沒設置代理，“正常”是指可以上國內的網站）。

## 樹莓派安裝配置 V2Ray

1. 安裝 V2Ray。可以使用 V2Ray 提供的 go.sh 腳本安裝，由於 GFW 會惡化對 GitHub 的訪問，直接運行腳本幾乎無法安裝，建議先下載 V2Ray 的壓縮包，然後用安裝腳本通過 --local 參數進行安裝。
2. 配置 V2Ray。按照前文教程將 V2Ray 配置成客戶端形式。然後執行 `curl -so /dev/null -w "%{http_code}" google.com -x socks5://127.0.0.1:1080` 確認 V2Ray 已經可以翻牆(命令中 socks5 指 inbound 協議爲 socks，1080 指該 inbound 端口是 1080)。如果執行這個命令出現了 301 或 200 這類數字的話代表可以翻牆，如果長時間沒反應或者是 000 的話說明不可以翻牆。

## 配置透明代理

### 爲 V2Ray 配置透明代理的入站和 DNS 分流

以下是 V2Ray 透明代理的配置示例，配置文件之後有說明。

```json
{
  "inbounds": [
    {
      "tag":"transparent",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy" // 透明代理使用 TPROXY 方式
        }
      }
    },
    {
      "port": 1080, 
      "protocol": "socks", // 入口協議爲 SOCKS 5
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "settings": {
        "auth": "noauth"
      }
    }
  ],
  "outbounds": [
    {
      "tag": "proxy",
      "protocol": "vmess", // 代理服務器
      "settings": {
        "vnext": [
          ...
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      },
      "mux": {
        "enabled": true
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIP"
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }      
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {
          "type": "http"
        }
      }
    },
    {
      "tag": "dns-out",
      "protocol": "dns",
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }  
    }
  ],
  "dns": {
    "servers": [
      "8.8.8.8", // 非中中國大陸域名使用 Google 的 DNS
      "1.1.1.1", // 非中中國大陸域名使用 Cloudflare 的 DNS(備用)
      "114.114.114.114", // 114 的 DNS (備用)
      {
        "address": "223.5.5.5", //中國大陸域名使用阿里的 DNS
        "port": 53,
        "domains": [
          "geosite:cn",
          "ntp.org",   // NTP 服務器
          "$myserver.address" // 此處改爲你 VPS 的域名
        ]
      }
    ]
  },
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      { // 劫持 53 端口 UDP 流量，使用 V2Ray 的 DNS
        "type": "field",
        "inboundTag": [
          "transparent"
        ],
        "port": 53,
        "network": "udp",
        "outboundTag": "dns-out" 
      },    
      { // 直連 123 端口 UDP 流量（NTP 協議）
        "type": "field",
        "inboundTag": [
          "transparent"
        ],
        "port": 123,
        "network": "udp",
        "outboundTag": "direct" 
      },    
      {
        "type": "field", 
        "ip": [ 
          // 設置 DNS 配置中的國內 DNS 服務器地址直連，以達到 DNS 分流目的
          "223.5.5.5",
          "114.114.114.114"
        ],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "ip": [ 
          // 設置 DNS 配置中的國內 DNS 服務器地址走代理，以達到 DNS 分流目的
          "8.8.8.8",
          "1.1.1.1"
        ],
        "outboundTag": "proxy" // 改爲你自己代理的出站 tag
      },
      { // 廣告攔截
        "type": "field", 
        "domain": [
          "geosite:category-ads-all"
        ],
        "outboundTag": "block"
      },
      { // BT 流量直連
        "type": "field",
        "protocol":["bittorrent"], 
        "outboundTag": "direct"
      },
      { // 直連中國大陸主流網站 ip 和 保留 ip
        "type": "field", 
        "ip": [
          "geoip:private",
          "geoip:cn"
        ],
        "outboundTag": "direct"
      },
      { // 直連中國大陸主流網站域名
        "type": "field", 
        "domain": [
          "geosite:cn"
        ],
        "outboundTag": "direct"
      }
    ]
  }
}
```

以上是 V2Ray 透明代理的參考配置，關於配置有一些注意點及說明:
* dokodemo-door 是用來接收透明代理的入站協議，followRedirect 項須爲 true 以及 sockopt.tproxy 項須爲 tproxy，建議開啓 snifing，否則路由無法匹配域名；
* 本節添加了 DNS 配置，用來對國內外域名進行 DNS 分流，需要 `DNS 配置`、`DNS 入站`、`DNS 出站`和`路由`四者配合，在本例中 DNS 入站直接使用透明代理入站，可參考[ DNS 及其應用](https://steemit.com/cn/@v2ray/dns)；
* 在 DNS 配置中，依次配置了 Google、Cloudflare、114 和阿里的 DNS，由於在阿里的 DNS 中指定了 domain，所以匹配的域名會用阿里的 DNS 查詢，其他的先查詢 Google 的 DNS，如果查不到的話再依次查 Cloudflare 及 114 的。所以達到了國內外域名 DNS 分流，以及 DNS 備用。要注意把 NTP 服務器和你自己 VPS 域名也加入到直連的 DNS ，否則會導致 V2Ray 無法與 VPS 正常連接；
* DNS 配置只是說明哪些域名查哪個 DNS，至於哪個 DNS 走代理哪個 DNS 直連要在 routing 裏設置規則；
* routing 也要設置 123 端口的 UDP 流量直連，不然的話要是時間誤差超出允許範圍(90s)，要使用 NTP 校準時間就要先連上代理，但是連代理又要確保時間準確，結果就是既連不上代理，也無法自動校準時間；
* freedom 的出站設置 domainStrategy 爲 UseIP，以避免直連時因爲使用本機的 DNS 出現一些奇怪問題；
* 注意要在所有的 outbound 加一個 255 的 mark,這個 mark 與下文 iptables 命令中 `iptables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff` 配合，以直連 V2Ray 發出的流量（blackhole 可以不配置 mark）。


### 配置透明代理規則

執行下面的命令開啓透明代理。由於使用了 TPROXY 方式的透明代理，所以 TCP 流量也是使用 mangle 表。以下命令中，以 `#` 開頭的爲註釋。

```
# 設置策略路由
ip rule add fwmark 1 table 100 
ip route add local 0.0.0.0/0 dev lo table 100

# 代理局域網設備
iptables -t mangle -N V2RAY
iptables -t mangle -A V2RAY -d 127.0.0.1/32 -j RETURN
iptables -t mangle -A V2RAY -d 224.0.0.0/4 -j RETURN 
iptables -t mangle -A V2RAY -d 255.255.255.255/32 -j RETURN 
iptables -t mangle -A V2RAY -d 192.168.0.0/16 -p tcp -j RETURN # 直連局域網，避免 V2Ray 無法啓動時無法連網關的 SSH，如果你配置的是其他網段（如 10.x.x.x 等），則修改成自己的
iptables -t mangle -A V2RAY -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN # 直連局域網，53 端口除外（因爲要使用 V2Ray 的 
iptables -t mangle -A V2RAY -p udp -j TPROXY --on-port 12345 --tproxy-mark 1 # 給 UDP 打標記 1，轉發至 12345 端口
iptables -t mangle -A V2RAY -p tcp -j TPROXY --on-port 12345 --tproxy-mark 1 # 給 TCP 打標記 1，轉發至 12345 端口
iptables -t mangle -A PREROUTING -j V2RAY # 應用規則

# 代理網關本機
iptables -t mangle -N V2RAY_MASK 
iptables -t mangle -A V2RAY_MASK -d 224.0.0.0/4 -j RETURN 
iptables -t mangle -A V2RAY_MASK -d 255.255.255.255/32 -j RETURN 
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -p tcp -j RETURN # 直連局域網
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -p udp ! --dport 53 -j RETURN # 直連局域網，53 端口除外（因爲要使用 V2Ray 的 DNS）
iptables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff    # 直連 SO_MARK 爲 0xff 的流量(0xff 是 16 進制數，數值上等同與上面V2Ray 配置的 255)，此規則目的是避免代理本機(網關)流量出現迴環問題
iptables -t mangle -A V2RAY_MASK -p udp -j MARK --set-mark 1   # 給 UDP 打標記,重路由
iptables -t mangle -A V2RAY_MASK -p tcp -j MARK --set-mark 1   # 給 TCP 打標記，重路由
iptables -t mangle -A OUTPUT -j V2RAY_MASK # 應用規則
```

執行了以上 ip 和 iptables 命令後，局域網同網段的設備以及網關本身就可以直接翻牆了。

關於 iptables 規則，比較容易理解，如果不太理解的話也可以 Google 搜索其他相關文章資料對比學習。在類 ss-redir 透明代理中，有兩個觀點非常深入人心：
```
1. UDP 只能 TPROXY
2. TPROXY 不能用於 OUTPUT 鏈
```
然後我們從這兩個觀點很容易得出一個推論：**無法在提供透明代理的本機(即本例中的網關)上對 UDP 透明代理**。
這個結論好像並沒有什麼問題，對吧？但實際上，在本例的配置中無論是 TCP 還是 UDP，都可以實現在本機上的透明代理，而且都是用 TPROXY。那好像又跟前面的結論矛盾了？其實關鍵在於這三句命令：
```
iptables -t mangle -A V2RAY_MASK -p udp -j MARK --set-mark 1
iptables -t mangle -A V2RAY_MASK -p tcp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j V2RAY_MASK
```
這幾句是說給 OUTPUT 鏈的 TCP 和 UDP 打個標記 1(OUTPUT 應用 V2RAY_MASK 鏈)。由於 Netfilter 的特性，在 OUTPUT 鏈打標記會使相應的包重路由到 PREROUTING 鏈上，在已經配置好了 PREROUTING 相關的透明代理的情況下，OUTPUT 鏈也可以透明代理了，也就是網關對自身的 UDP 流量透明代理自身（當然 TCP 也不在話下）。因爲這是 netfilter 本身的特性，Shadowsocks 應該也可以用同樣的方法對本機的 UDP 透明代理，但我沒有實際測試過效果。

## 開機自動運行透明代理規則
由於策略路由以及iptables 有重啓會失效的特性，所以當測試配置沒有問題之後，需要再弄個服務在開機時自動配置策略路由和 iptables，否則每次開機的時候就要手動來一遍了。

1. 由於 iptables 命令有點多，所以先將 iptables 規則保存到 /etc/iptables/rules.v4 中。
  ```
  mkdir -p /etc/iptables && iptables-save > /etc/iptables/rules.v4
  ```

2. 在 /etc/systemd/system/ 目錄下創建一個名爲 tproxyrule.service 的文件，然後添加以下內容並保存。

  ```
  [Unit]
  Description=Tproxy rule
  After=network.target
  Wants=network.target

  [Service]

  Type=oneshot
  #注意分號前後要有空格
  ExecStart=/sbin/ip rule add fwmark 1 table 100 ; /sbin/ip route add local 0.0.0.0/0 dev lo table 100 ; /sbin/iptables-restore /etc/iptables/rules.v4

  [Install]
  WantedBy=multi-user.target
  ```
3. 執行下面的命令使 tproxyrule.service 可以開機自動運行。

  ```
  systemctl enable tproxyrule
  ```

## 其他

### 解決 too many open files 問題
對 UDP 透明代理比較容易出現”卡住“的情況，這個時候細心的朋友可能會發現日誌中出現了非常多 "too many open files" 的語句,這主要是受到最大文件描述符數值的限制，把這個數值往大調就好了。設置步驟如下。
1. 修改 /etc/systemd/system/v2ray.service 文件，在 `[Service]` 下加入 `LimitNPROC=500` 和 `LimitNOFILE=1000000`，修改後的內容如下。

  ```
  [Unit]
  Description=V2Ray Service
  After=network.target
  Wants=network.target

  [Service]
  # This service runs as root. You may consider to run it as another user for security concerns.
  # By uncommenting the following two lines, this service will run as user v2ray/v2ray.
  # More discussion at https://github.com/v2ray/v2ray-core/issues/1011
  # User=v2ray
  # Group=v2ray
  Type=simple
  PIDFile=/run/v2ray.pid
  ExecStart=/usr/bin/v2ray/v2ray -config /etc/v2ray/config.json
  Restart=on-failure
  # Don't restart in the case of configuration error
  RestartPreventExitStatus=23
  LimitNPROC=500
  LimitNOFILE=1000000

  [Install]
  WantedBy=multi-user.target
  ```
2. 執行 `systemctl daemon-reload && systemctl restart v2ray` 生效。

### 設定網關爲靜態 IP

最好給網關設成靜態IP，以免需要重啓的時 IP 發生變化。如何設置請自行探究。
提示一下，如果你用 nmcli 命令設置靜態 IP，最好先另外添加一個 connection 進行配置，配置好之後在切換到新添加的這個 connection 來。因爲如果在原有的 connection 上直接修改成靜態 IP **可能**會導致**無法透明代理**。

### 設定 DHCP

在路由器上設定 DHCP，將網關地址指向網關設備，在本文的舉例中即爲樹莓派的IP 192.168.1.22； DNS 隨意，因爲已經配置了劫持 53 端口的 UDP，當然填常規的 DNS 也更是沒有問題的。

## 備註

1. TPROXY 與 REDIRECT 是針對 TCP 而言的兩種透明代理模式，兩者的差異主要在於 TPROXY 可以透明代理 IPV6，而 REDIRECT 不行，本文主要是將透明代理模式改爲 TPROXY 並且使用了 V2Ray 的 DNS。但我沒有 IPV6 環境，無法進行測試，所以本文只適用於 IPV4。
2. 據我瞭解，到目前（2019.10）爲止，在我所知的具備透明代理功能的翻牆工具中，TCP 透明代理方式可以使用的 TPROXY 的只有 V2Ray。所以你要找其他資料參考的話，要注意透明代理方式，因爲基本上都是 REDIRECT 模式的（包括 V2Ray 官網給的示例）。
3. 在透明代理中，不要用 V2Ray 開放 53 端口做 DNS 服務器。如果這麼做了，DNS 會出問題，這應該是個 BUG。等我整理好之後再反饋到 V2Ray 項目。
4. 我用 [NatTypeTester](https://github.com/HMBSbige/NatTypeTester) 測試過 NAT 類型，結果是 FullCone，但也看到有反饋說玩遊戲依然是 PortRestrictedCone。我也不清楚是怎麼回事，這點需要玩遊戲的朋友來確認了。不過目前測試發現代理 QUIC 的效果還不不錯的。
5. 本文的說明內容還不夠完善，後續還要針對配置進行詳細說明，大約改 3~5 個版本，然後再提交到新教程上。

## 參考資料

* [DNS 及其應用](https://steemit.com/cn/@v2ray/dns)
* [漫談各種黑科技式 DNS 技術在代理環境中的應用](https://medium.com/@TachyonDevel/%E6%BC%AB%E8%B0%88%E5%90%84%E7%A7%8D%E9%BB%91%E7%A7%91%E6%8A%80%E5%BC%8F-dns-%E6%8A%80%E6%9C%AF%E5%9C%A8%E4%BB%A3%E7%90%86%E7%8E%AF%E5%A2%83%E4%B8%AD%E7%9A%84%E5%BA%94%E7%94%A8-62c50e58cbd0)
* [Linux transparent proxy support](https://powerdns.org/tproxydoc/tproxy.md.html)
* [V2Ray 透明代理樣例](https://v2ray.com/chapter_02/protocols/dokodemo.html#example)
* [iptables - Wikipedia](https://en.wikipedia.org/wiki/Iptables)


## 更新歷史

- 2019-10-19 初版 
- 2019-10-25 關於配置的說明
- 2019-10-26 改善 DNS 配置
- 2019-10-27 改進
- 2019-10-28 解釋重路由
